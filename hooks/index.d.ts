import { PostAuthenticationLoginResponses } from "@/queries/types.gen";
interface DefaultResponse {
  id?: number;
  success: boolean;
  message: string;
}

interface AuthResponse {
  id?: number;
  success: boolean;
  message: string;
  token?: string;
  user?: IUser;
}

type IUser = PostAuthenticationLoginResponses["200"]["user"];
