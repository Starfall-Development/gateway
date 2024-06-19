export default interface ApiCommand<Options = {
    [key: string]: any;
}, Returns = any> {
    handle(options: Options): Promise<Returns>;
}
