// Dumps evenly spaced frames from a video as near-lossless JPEG, using AVFoundation.
// No ffmpeg on this machine; AVAssetImageGenerator decodes exactly the frames we ask for.
// Usage: swift tools/extract-frames.swift <video> <outDir> <count> [duration]
import AVFoundation
import CoreImage
import Foundation
import ImageIO
import UniformTypeIdentifiers

let args = CommandLine.arguments
guard args.count >= 4 else {
    FileHandle.standardError.write("usage: extract-frames.swift <video> <outDir> <count> [duration]\n".data(using: .utf8)!)
    exit(2)
}
let src = URL(fileURLWithPath: args[1])
let outDir = URL(fileURLWithPath: args[2])
let count = Int(args[3])!

let asset = AVURLAsset(url: src)
let duration = args.count > 4 ? Double(args[4])! : CMTimeGetSeconds(asset.duration)
try? FileManager.default.createDirectory(at: outDir, withIntermediateDirectories: true)

let gen = AVAssetImageGenerator(asset: asset)
gen.appliesPreferredTrackTransform = true
gen.requestedTimeToleranceBefore = .zero
gen.requestedTimeToleranceAfter = .zero

// One frame per slot: slot i is the video at i * duration / count seconds.
let times = (0..<count).map { i in
    NSValue(time: CMTime(seconds: Double(i) * duration / Double(count), preferredTimescale: 600))
}

let group = DispatchGroup()
group.enter()
var written = 0
var failed = 0
gen.generateCGImagesAsynchronously(forTimes: times) { requested, image, _, result, error in
    defer { if written + failed == count { group.leave() } }
    guard result == .succeeded, let image else {
        failed += 1
        FileHandle.standardError.write("frame \(CMTimeGetSeconds(requested)) failed: \(error?.localizedDescription ?? "?")\n".data(using: .utf8)!)
        return
    }
    let idx = Int((CMTimeGetSeconds(requested) / duration * Double(count)).rounded())
    let url = outDir.appendingPathComponent(String(format: "%03d.jpg", idx))
    guard let dest = CGImageDestinationCreateWithURL(url as CFURL, UTType.jpeg.identifier as CFString, 1, nil) else {
        failed += 1
        return
    }
    CGImageDestinationAddImage(dest, image, [kCGImageDestinationLossyCompressionQuality: 0.97] as CFDictionary)
    CGImageDestinationFinalize(dest)
    written += 1
}
group.wait()
print("\(written) frames -> \(outDir.path) (\(failed) failed)")
exit(failed > 0 ? 1 : 0)
