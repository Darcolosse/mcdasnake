import { SettingsAction } from "../components/SettingsAction";

export const CookieType = {
  Username: "username",
  Design: "design",
  AntispamServer: "antispam",
}

export function setCookie(cookieType: string, value: string, time: number) {
  var expires = "";
  if (time) {
    var date = new Date();
    date.setTime(date.getTime() + (cookieType === CookieType.AntispamServer ? time : time*24*60*60*1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = cookieType + "=" + (value || "")  + expires + "; path=/";
}

export function getCookie(cookieType: string) {
  var nameEQ = cookieType + "=";
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
    var c = ca[i];
    if(c) {
      while (c.charAt(0)==' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
  }
  return undefined;
}

export function getCookiePlus(cookieType: string) {
  let result = getCookie(cookieType);
  if (!result){
    result = getDefaultValue(cookieType);
  }
  return result;
}

export function getDefaultValue(cookieType: string) {
  switch (cookieType) {
    case "username":
        return "newPlayer";

    case "design":
      return SettingsAction.getCookie();
  
    default:
      break;
  }
}
