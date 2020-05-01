import {Response} from "node-fetch"
export default class Utils{
  increse(){

  }
  public static getCookie(res:Response){
    return (res.headers.get("set-cookie") || "").split(";")[0];
  }
}