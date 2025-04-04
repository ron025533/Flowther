export type Presentation = {
    _id: string;
    author: string;
    title: string;
    content: Content[];
}

export type Content = {
    section: string;
    order: number;
    content: string;
}