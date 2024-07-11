export interface RedirectAuthHandler {
    type: "redirect";
    url: string;
    key?: string
    oneTimeUse?: boolean
}