import URI from "vscode-uri";
import { Host } from "./host";

export class Resource {
  public static from(source: Host, uri: URI): Resource {
    return new this(source, uri);
  }
  protected constructor(readonly source: Host, readonly uri: URI) { }
  public into(target: Host): URI {
    switch (target) {
      case Host.Native:
        return this.readNative();
      case Host.WSL:
        return this.readWSL();
    }
  }
  protected readNative(): URI {
    switch (this.source) {
      case Host.Native:
        return this.uri;
      case Host.WSL:
        const search = /^file:\/\/\/mnt\/([a-zA-Z])\//;
        const replacer = (_match: string, capture: string, _offset: number, _entire: string): string => {
          let out = "file:///";
          out += capture;
          out += ":";
          out += "/";
          return out;
        };
        const skipEncoding = true;
        return URI.parse(this.uri.toString(skipEncoding).replace(search, replacer));
    }
  }
  protected readWSL(): URI {
    switch (this.source) {
      case Host.Native:
        const search = /^file:\/\/\/([a-zA-Z]):\//;
        const replacer = (_match: string, capture: string, _offset: number, _entire: string): string => {
          let out = "file:///mnt/";
          out += capture;
          out += "/";
          return out;
        };
        const skipEncoding = true;
        return URI.parse(this.uri.toString(skipEncoding).replace(search, replacer));
      case Host.WSL:
        return this.uri;
    }
  }
}
