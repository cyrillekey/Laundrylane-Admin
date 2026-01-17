interface DefaultReponse {
  id?: number;
  success: boolean;
  message: string;
}

interface AuthReponse {
  id?: number;
  success: boolean;
  message: string;
  token?: string;
}
