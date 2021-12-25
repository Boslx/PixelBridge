import { BaseSink } from "./BaseSink"

import * as dgram from "dgram";

export class BasicSink extends BaseSink {
    protected udp: dgram.Socket;
    constructor(width: number, height: number, protected ip: string, protected port: number) {
        super(width, height);
        this.initConnection();
    }

    initConnection() {
        this.udp = dgram.createSocket('udp4');
        this.udp.connect(this.port, this.ip);
        // console.log("connected");
    }

    async sendFrame(frame: Frame): Promise<void> {
        await new Promise((resolve, reject) => this.udp.send(frame.buffer, resolve));
    }

    setBrightness(brightness: number) {
        throw new Error("Not Implemented");
    }
}
