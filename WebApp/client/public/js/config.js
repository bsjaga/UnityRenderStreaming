export async function getServerConfig() {
  const protocolEndPoint = location.origin +  (location.origin === "https://api.adloid.in" ? '/renderstreaming' : '') + '/config';
  const createResponse = await fetch(protocolEndPoint);
  return await createResponse.json();
}

export function getRTCConfiguration() {
  let config = {};
  config.sdpSemantics = 'unified-plan';
  config.iceServers = [{ urls: ['stun:stun.l.google.com:19302'] }];
  return config;
}