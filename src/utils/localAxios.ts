import axios from "axios";
import http from "node:http";

const TAILSCALE_SOCKET = "/run/tailscale/tailscaled.sock";
const LOCALAPI_HOST = "local-tailscaled.sock"; // ASCII hyphen!

 function createLocalAxiosInstance(socketPath = TAILSCALE_SOCKET) {
  return axios.create({
    baseURL: `http://${LOCALAPI_HOST}`,
    socketPath,
    httpAgent: new http.Agent(),
    headers: {
      Host: LOCALAPI_HOST,
      "User-Agent": "localAxios/1",
      Accept: "application/json",
    },
    timeout: 5000,
  });
}
const localAxios = createLocalAxiosInstance()
export default localAxios