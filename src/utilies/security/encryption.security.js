import CryptoJS from "crypto-js";


export const generateEncryption=({plainText="",signture=process.env.ENCRYPTION_SIGNTURE}={})=>{
const encrypt=CryptoJS.AES.encrypt(plainText,signture).toString()
return encrypt

}



export const generateDecryption=({cipherText="",signture=process.env.ENCRYPTION_SIGNTURE}={})=>{
const Decrypt=CryptoJS.AES.decrypt(cipherText,signture).toString(CryptoJS.enc.Utf8)
return Decrypt
}