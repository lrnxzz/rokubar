// Stands in for the adapter of a TV in standby: prints "wake" for every datagram on the Discard port that
// holds its magic packet, 6 bytes of FFh then its MAC 16 times (AMD white paper 20213), anywhere inside.
const dgram = require("node:dgram");
const fs = require("node:fs");

const mac = Buffer.from(fs.readFileSync("/sys/class/net/eth0/address", "ascii").trim().replaceAll(":", ""), "hex");

const magicPacket = Buffer.concat([
    Buffer.alloc(6, 0xff),
    ...Array(16).fill(mac),
]);

const socket = dgram.createSocket("udp4");

socket.on("message", (message) => {
    if (message.includes(magicPacket)) {
        console.log("wake");
    }
});

socket.bind(9);
