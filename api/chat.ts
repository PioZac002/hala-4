// Deployed endpoint for the answer desk: POST /api/chat.
//
// The handler takes a Web Request and returns a Web Response, which is what Vercel
// (Node and Edge runtimes) and Netlify Functions v2 both expect. Set ANTHROPIC_API_KEY
// in the project's environment variables; without it the endpoint answers from the price
// list instead of the model, and says so in the widget.
import { chat } from '../server/chat'

export default function handler(request: Request): Promise<Response> {
  return chat(request)
}
