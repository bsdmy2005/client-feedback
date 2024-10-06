// lib/postmarkClient.js
import { ServerClient } from 'postmark';

const postmarkClient = new ServerClient(process.env.POSTMARK_SERVER_API_TOKEN as string);

export default postmarkClient;
