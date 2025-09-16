import { server } from "./app";
import { config } from "./config";


server.listen(config.port, () => {
    console.log(`Server is listening to this port ${config.port}`);
})