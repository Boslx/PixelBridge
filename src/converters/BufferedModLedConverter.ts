import {BaseSink} from "../sinks/BaseSink";

export class BufferedModLedConverter {
    sinkFrames: Frame[] = [];
    numFramesToBuffer: number = 25;
    counterBufferedFrames: number = 0;
    lengthSingleFrame: number = this.panelWidth * this.panelHeight;

    constructor(protected panelNumX: number, protected panelNumY: number, protected panelWidth: number, protected panelHeight: number, protected sinks: BaseSink[]) {
        let bufSize = panelWidth * panelHeight * 3;
        sinks.forEach(() => {
            this.sinkFrames.push({
                width: panelWidth, height: panelHeight, buffer: Buffer.alloc(bufSize * this.numFramesToBuffer)
            });
        });
    }

    convertFrame(frame: Frame): boolean {
        for (let panelY = 0; panelY < this.panelNumY; panelY++) {
            for (let panelX = 0; panelX < this.panelNumX; panelX++) {
                let panelNum = panelY * this.panelNumX + panelX;

                for (let y = 0; y < this.panelHeight; y++) {
                    let frameXOffset = panelX * this.panelWidth;
                    let frameOffset = panelY * this.panelNumX * this.panelWidth * this.panelHeight + frameXOffset;
                    frameOffset += y * this.panelNumX * this.panelWidth;

                    let panelOffset = y * this.panelWidth;

                    // console.log({panelY: panelY, panelX: panelX, y: y, frameXOffset: frameXOffset, frameOffset: frameOffset, panelOffset: panelOffset});
                    if (this.sinkFrames[panelNum]) {
                        frame.buffer.copy(this.sinkFrames[panelNum].buffer, (panelOffset + this.counterBufferedFrames * this.lengthSingleFrame) * 3, frameOffset * 3, (frameOffset + this.panelWidth) * 3);
                    }
                }
            }
        }

        ++this.counterBufferedFrames;

        if (this.numFramesToBuffer <= this.counterBufferedFrames) {
            this.counterBufferedFrames = 0;
            return true;
        } else {
            return false;
        }
    }

    async sendFrame(frame: Frame) {
        if (this.convertFrame(frame)) {
            await Promise.all(this.sinks.map((sink, index) => sink.sendFrame(this.sinkFrames[index])));
        }
    }
}
