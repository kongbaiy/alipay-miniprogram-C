import { RSAKey, hex2b64, KEYUTIL} from './wx_rsa.js'
import CryptoJS from './aes.min.js'

var iv = "E08ADE2699714B87";

export var smy_crypto = {
    rsa_encrypt: function (str, key) {
        var encrypt_rsa = RSAKey();
        encrypt_rsa = KEYUTIL.getKey('-----BEGIN PUBLIC KEY-----' + key + '-----END PUBLIC KEY-----');
        var encStr = encrypt_rsa.encrypt(str)
        encStr = hex2b64(encStr);

        return encStr;
    },
    random_code: function (randomFlag, min, max) {
        var str = "",
            range = min,
            arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

        // 随机产生
        if (randomFlag) {
            range = Math.round(Math.random() * (max - min)) + min;
        }
        for (var i = 0; i < range; i++) {
            var pos = Math.round(Math.random() * (arr.length - 1));
            str += arr[pos];
        }
        return str;
    },
    /**
     * 加密（需要先加载lib/aes/aes.min.js文件）
     * @param word
     * @param code
     * @returns {*}
     */
    aes_encrypt: function (word, code) {
        var key = CryptoJS.enc.Utf8.parse(code);
        var srcs = CryptoJS.enc.Utf8.parse(word);
        var encrypted = CryptoJS.AES.encrypt(srcs, key, { iv: CryptoJS.enc.Utf8.parse(iv), mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
        return encrypted.ciphertext.toString();
    },
    /**
     * 解密
     * @param word
     * @returns {*}
     */
    aes_decrypt: function (word, code) {
        var key = CryptoJS.enc.Utf8.parse(code);
        var srcs = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Hex.parse(word));
        var decrypt = CryptoJS.AES.decrypt(srcs, key, { iv: CryptoJS.enc.Utf8.parse(iv), mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
        return CryptoJS.enc.Utf8.stringify(decrypt).toString();
    }
}