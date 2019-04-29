const development = true
let config
if(development){ // if development
    config = {
        apiBaseURL: 'http://gestaon.dynu.net:8080',
        socketServer: 'http://gestaon.dynu.net:8080',
        development
    }
}
else { // if production
    config = {
        apiBaseURL: 'http://api.gestaon.com',
        socketServer: 'http://server.gestaon.com',
        development
    }
}
export default config