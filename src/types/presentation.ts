export type Presentation = {
    _id: string|null;
    author: string;
    title: string;
    content: Content[];
}

export type Content = {
    section: string;
    order: number;
    content: string;
}