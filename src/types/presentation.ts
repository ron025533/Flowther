export type Presentation = {
    author: string;
    title: string;
    content: Content[];
}

export type Content = {
    section: string;
    order: number;
    content: string;
}