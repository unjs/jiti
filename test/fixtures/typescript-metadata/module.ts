import "reflect-metadata";
function decorator() {
  return function (object: any, propertyName: any) {
    const reflectMetadataType =
      Reflect && Reflect.getMetadata
        ? Reflect.getMetadata("design:type", object, propertyName)
        : undefined;

    console.log(reflectMetadataType);
  };
}
export class File {
  @decorator()
  property: string | undefined;
}
