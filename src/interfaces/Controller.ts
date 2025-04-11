import { Request, Response } from "express";

interface Controller {
    get(request: Request, response: Response): Promise<Response | void>;
    getAll(request: Request, response: Response): Promise<Response | void>;
    post(request: Request, response: Response): Promise<Response | void>;
    delete(request: Request, response: Response): Promise<Response | void>;
    update(request: Request, response: Response): Promise<Response | void>;

}

export default Controller;