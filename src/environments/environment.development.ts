const keycloakConfig = {
  url: 'https://localhost/auth',
  realm: 'real',
  clientId: 'cliId',
};

export const environment = {
  production: false,
  keycloakConfig,
  apiUrl: "http://localhost:8080/api"
};
