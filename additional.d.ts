declare const __COMMIT_HASH__: string;
declare const __BRANCH_NAME__: string;

declare module "*.svg" {
    export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
    const content: string;
    export default content;
}
declare module "*.svg?react" {
    const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
    export default ReactComponent;
}
