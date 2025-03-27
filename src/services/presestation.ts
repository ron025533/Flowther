import axios, { AxiosResponse } from "axios";
import { Presentation } from "../types/presentation";
import { BACKEND_API_URL } from "../constants";

export const create = async (presentation: Presentation): Promise<Presentation> => {
    try {
        const response: AxiosResponse<Presentation> = await axios.post(`${BACKEND_API_URL}/presentation/create`, presentation);
        return response.data;
    } catch (e) {
        console.error(e);
        throw e;
    }
}

export const findAll = async (): Promise<Presentation[]> => {
    try {
        const response: AxiosResponse<Presentation[]> = await axios.get(`${BACKEND_API_URL}/presentation/find-all`);
        return response.data;
    } catch (e) {
        console.error(e);
        throw e;
    }
}

export const findById = async(id: string): Promise<Presentation> => {
    try {
        const response: AxiosResponse<Presentation> = await axios.get(`${BACKEND_API_URL}/presentation/find/${id}`);
        return response.data;
    } catch (e) {
        console.error(e);
        throw e;
    }
}