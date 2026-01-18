import { decryptCipherText, encryptPlainText } from "@/utils";
import sharedValues from "@/utils/sharedValues";
import Cookie from "js-cookie";
import dayjs from "dayjs";
import { IUser } from "@/hooks";
class AuthenticationService {
  static getToken() {
    const cookie = Cookie.get(sharedValues.token_key);
    if (cookie) {
      return decryptCipherText(cookie, sharedValues.enryptionKey!);
    }
    return null;
  }
  static setToken(token: string) {
    const encryptedToken = encryptPlainText(token, sharedValues.enryptionKey!);

    Cookie.set(sharedValues.token_key, encryptedToken, {
      expires: dayjs().add(24, "hours").toDate(),
    });
  }
  static setUser(user: IUser) {
    Cookie.set(sharedValues.user_key, JSON.stringify(user), {
      expires: dayjs().add(24, "hours").toDate(),
    });
  }
  static getUser(): IUser | null {
    const cookie = Cookie.get(sharedValues.user_key);
    if (cookie) {
      return JSON.parse(cookie);
    }
    return null;
  }
  static logOut() {
    Cookie.remove(sharedValues.token_key);
    Cookie.remove(sharedValues.user_key);
  }
}

export default AuthenticationService;
