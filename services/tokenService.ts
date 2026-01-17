import { decryptCipherText, encryptPlainText } from "@/utils";
import sharedValues from "@/utils/sharedValues";
import Cookie from "js-cookie";
import dayjs from "dayjs";
class AuthenticationService {
  static getToken() {
    const cookie = Cookie.get(sharedValues.token_key);
    if (cookie) {
      return decryptCipherText(cookie, sharedValues.enryptionKey!);
    }
    return null;
  }
  static setToken(token: string) {
    console.log(sharedValues.enryptionKey);
    const encryptedToken = encryptPlainText(token, sharedValues.enryptionKey!);
    console.log(encryptedToken);
    Cookie.set(sharedValues.token_key, encryptedToken, {
      expires: dayjs().add(24, "hours").toDate(),
    });
  }

  static logOut() {
    Cookie.remove(sharedValues.token_key);
    Cookie.remove(sharedValues.user_key);
  }
}

export default AuthenticationService;
