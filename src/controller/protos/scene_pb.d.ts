// package: 
// file: scene.proto

import * as jspb from "google-protobuf";

export class Vec3 extends jspb.Message {
  getX(): number;
  setX(value: number): void;

  getY(): number;
  setY(value: number): void;

  getZ(): number;
  setZ(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Vec3.AsObject;
  static toObject(includeInstance: boolean, msg: Vec3): Vec3.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Vec3, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Vec3;
  static deserializeBinaryFromReader(message: Vec3, reader: jspb.BinaryReader): Vec3;
}

export namespace Vec3 {
  export type AsObject = {
    x: number,
    y: number,
    z: number,
  }
}

export class Vec4 extends jspb.Message {
  getX(): number;
  setX(value: number): void;

  getY(): number;
  setY(value: number): void;

  getZ(): number;
  setZ(value: number): void;

  getW(): number;
  setW(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Vec4.AsObject;
  static toObject(includeInstance: boolean, msg: Vec4): Vec4.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Vec4, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Vec4;
  static deserializeBinaryFromReader(message: Vec4, reader: jspb.BinaryReader): Vec4;
}

export namespace Vec4 {
  export type AsObject = {
    x: number,
    y: number,
    z: number,
    w: number,
  }
}

export class Mat4 extends jspb.Message {
  hasX(): boolean;
  clearX(): void;
  getX(): Vec4 | undefined;
  setX(value?: Vec4): void;

  hasY(): boolean;
  clearY(): void;
  getY(): Vec4 | undefined;
  setY(value?: Vec4): void;

  hasZ(): boolean;
  clearZ(): void;
  getZ(): Vec4 | undefined;
  setZ(value?: Vec4): void;

  hasW(): boolean;
  clearW(): void;
  getW(): Vec4 | undefined;
  setW(value?: Vec4): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Mat4.AsObject;
  static toObject(includeInstance: boolean, msg: Mat4): Mat4.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Mat4, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Mat4;
  static deserializeBinaryFromReader(message: Mat4, reader: jspb.BinaryReader): Mat4;
}

export namespace Mat4 {
  export type AsObject = {
    x?: Vec4.AsObject,
    y?: Vec4.AsObject,
    z?: Vec4.AsObject,
    w?: Vec4.AsObject,
  }
}

export class Buffer extends jspb.Message {
  getData(): Uint8Array | string;
  getData_asU8(): Uint8Array;
  getData_asB64(): string;
  setData(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Buffer.AsObject;
  static toObject(includeInstance: boolean, msg: Buffer): Buffer.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Buffer, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Buffer;
  static deserializeBinaryFromReader(message: Buffer, reader: jspb.BinaryReader): Buffer;
}

export namespace Buffer {
  export type AsObject = {
    data: Uint8Array | string,
  }
}

export class BufferView extends jspb.Message {
  getBuffer(): number;
  setBuffer(value: number): void;

  getByteoffset(): number;
  setByteoffset(value: number): void;

  getBytelength(): number;
  setBytelength(value: number): void;

  getBytestride(): number;
  setBytestride(value: number): void;

  getTarget(): BufferTargetMap[keyof BufferTargetMap];
  setTarget(value: BufferTargetMap[keyof BufferTargetMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BufferView.AsObject;
  static toObject(includeInstance: boolean, msg: BufferView): BufferView.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BufferView, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BufferView;
  static deserializeBinaryFromReader(message: BufferView, reader: jspb.BinaryReader): BufferView;
}

export namespace BufferView {
  export type AsObject = {
    buffer: number,
    byteoffset: number,
    bytelength: number,
    bytestride: number,
    target: BufferTargetMap[keyof BufferTargetMap],
  }
}

export class MeshPrimitive extends jspb.Message {
  getIndices(): number;
  setIndices(value: number): void;

  getAttributesMap(): jspb.Map<string, number>;
  clearAttributesMap(): void;
  getMode(): MeshPrimitiveModeMap[keyof MeshPrimitiveModeMap];
  setMode(value: MeshPrimitiveModeMap[keyof MeshPrimitiveModeMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MeshPrimitive.AsObject;
  static toObject(includeInstance: boolean, msg: MeshPrimitive): MeshPrimitive.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MeshPrimitive, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MeshPrimitive;
  static deserializeBinaryFromReader(message: MeshPrimitive, reader: jspb.BinaryReader): MeshPrimitive;
}

export namespace MeshPrimitive {
  export type AsObject = {
    indices: number,
    attributesMap: Array<[string, number]>,
    mode: MeshPrimitiveModeMap[keyof MeshPrimitiveModeMap],
  }
}

export class Mesh extends jspb.Message {
  clearPrimitivesList(): void;
  getPrimitivesList(): Array<MeshPrimitive>;
  setPrimitivesList(value: Array<MeshPrimitive>): void;
  addPrimitives(value?: MeshPrimitive, index?: number): MeshPrimitive;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Mesh.AsObject;
  static toObject(includeInstance: boolean, msg: Mesh): Mesh.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Mesh, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Mesh;
  static deserializeBinaryFromReader(message: Mesh, reader: jspb.BinaryReader): Mesh;
}

export namespace Mesh {
  export type AsObject = {
    primitivesList: Array<MeshPrimitive.AsObject>,
  }
}

export class Node extends jspb.Message {
  clearChildrenList(): void;
  getChildrenList(): Array<Node>;
  setChildrenList(value: Array<Node>): void;
  addChildren(value?: Node, index?: number): Node;

  hasMesh(): boolean;
  clearMesh(): void;
  getMesh(): Mesh | undefined;
  setMesh(value?: Mesh): void;

  hasMatrix(): boolean;
  clearMatrix(): void;
  getMatrix(): Mat4 | undefined;
  setMatrix(value?: Mat4): void;

  hasRotation(): boolean;
  clearRotation(): void;
  getRotation(): Vec4 | undefined;
  setRotation(value?: Vec4): void;

  hasScale(): boolean;
  clearScale(): void;
  getScale(): Vec3 | undefined;
  setScale(value?: Vec3): void;

  hasTranslation(): boolean;
  clearTranslation(): void;
  getTranslation(): Vec3 | undefined;
  setTranslation(value?: Vec3): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Node.AsObject;
  static toObject(includeInstance: boolean, msg: Node): Node.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Node, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Node;
  static deserializeBinaryFromReader(message: Node, reader: jspb.BinaryReader): Node;
}

export namespace Node {
  export type AsObject = {
    childrenList: Array<Node.AsObject>,
    mesh?: Mesh.AsObject,
    matrix?: Mat4.AsObject,
    rotation?: Vec4.AsObject,
    scale?: Vec3.AsObject,
    translation?: Vec3.AsObject,
  }
}

export class Scene extends jspb.Message {
  clearBuffersList(): void;
  getBuffersList(): Array<Buffer>;
  setBuffersList(value: Array<Buffer>): void;
  addBuffers(value?: Buffer, index?: number): Buffer;

  clearBufferviewsList(): void;
  getBufferviewsList(): Array<BufferView>;
  setBufferviewsList(value: Array<BufferView>): void;
  addBufferviews(value?: BufferView, index?: number): BufferView;

  clearMeshesList(): void;
  getMeshesList(): Array<Mesh>;
  setMeshesList(value: Array<Mesh>): void;
  addMeshes(value?: Mesh, index?: number): Mesh;

  hasRootnode(): boolean;
  clearRootnode(): void;
  getRootnode(): Node | undefined;
  setRootnode(value?: Node): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Scene.AsObject;
  static toObject(includeInstance: boolean, msg: Scene): Scene.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Scene, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Scene;
  static deserializeBinaryFromReader(message: Scene, reader: jspb.BinaryReader): Scene;
}

export namespace Scene {
  export type AsObject = {
    buffersList: Array<Buffer.AsObject>,
    bufferviewsList: Array<BufferView.AsObject>,
    meshesList: Array<Mesh.AsObject>,
    rootnode?: Node.AsObject,
  }
}

export class RenderItem extends jspb.Message {
  getVertexcount(): number;
  setVertexcount(value: number): void;

  getPositionbuffer(): Uint8Array | string;
  getPositionbuffer_asU8(): Uint8Array;
  getPositionbuffer_asB64(): string;
  setPositionbuffer(value: Uint8Array | string): void;

  getUvbuffer(): Uint8Array | string;
  getUvbuffer_asU8(): Uint8Array;
  getUvbuffer_asB64(): string;
  setUvbuffer(value: Uint8Array | string): void;

  getIndexcount(): number;
  setIndexcount(value: number): void;

  getIndexbuffer(): Uint8Array | string;
  getIndexbuffer_asU8(): Uint8Array;
  getIndexbuffer_asB64(): string;
  setIndexbuffer(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RenderItem.AsObject;
  static toObject(includeInstance: boolean, msg: RenderItem): RenderItem.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RenderItem, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RenderItem;
  static deserializeBinaryFromReader(message: RenderItem, reader: jspb.BinaryReader): RenderItem;
}

export namespace RenderItem {
  export type AsObject = {
    vertexcount: number,
    positionbuffer: Uint8Array | string,
    uvbuffer: Uint8Array | string,
    indexcount: number,
    indexbuffer: Uint8Array | string,
  }
}

export class RenderItems extends jspb.Message {
  clearItemsList(): void;
  getItemsList(): Array<RenderItem>;
  setItemsList(value: Array<RenderItem>): void;
  addItems(value?: RenderItem, index?: number): RenderItem;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RenderItems.AsObject;
  static toObject(includeInstance: boolean, msg: RenderItems): RenderItems.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RenderItems, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RenderItems;
  static deserializeBinaryFromReader(message: RenderItems, reader: jspb.BinaryReader): RenderItems;
}

export namespace RenderItems {
  export type AsObject = {
    itemsList: Array<RenderItem.AsObject>,
  }
}

export interface BufferTargetMap {
  ARRAY_BUFFER: 0;
  ELEMENT_ARRAY_BUFFER: 1;
}

export const BufferTarget: BufferTargetMap;

export interface MeshPrimitiveModeMap {
  POINTS: 0;
  LINES: 1;
  LINE_LOOP: 2;
  LINE_STRIP: 3;
  TRIANGLES: 4;
  TRIANGLE_STRIP: 5;
  TRIANGLE_FAN: 6;
}

export const MeshPrimitiveMode: MeshPrimitiveModeMap;

