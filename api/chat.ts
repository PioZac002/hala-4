// Deployed endpoint for the answer desk: POST /api/chat.
//
// The handler takes a Web Request and returns a Web Response, which is what Vercel
// (Node and Edge runtimes) and Netlify Functions v2 both expect. Set CHAT_API_KEY (and
// CHAT_BASE_URL / CHAT_MODEL to move off the default free provider) in the project's
// environment variables; without a key the endpoint answers from the price list instead
// of the model, and says so in the widget.
import { chat } from '../server/chat'

export default function handler(request: Request): Promise<Response> {
  return chat(request)
}
