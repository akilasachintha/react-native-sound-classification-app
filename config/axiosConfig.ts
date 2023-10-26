import axios, {AxiosInstance} from 'axios';
import {useLoadingContext} from "@context/LoadingContext";

const BASE_URL: string = 'http://13.126.222.46:5000/v1/';

const createAxiosInstance = (baseURL: string): AxiosInstance => {
    const instance = axios.create({
        baseURL
    });

    const {showLoading} = useLoadingContext();

    // Request Interceptor
    instance.interceptors.request.use(
        (request) => {
            showLoading();
            return request;
        }
    );

    // Response Interceptor
    instance.interceptors.response.use(
        (response) => {
            // Handle other status codes here
            if (response.status >= 400 && response.status < 500) {
                console.error('Client Error:', response.status, response.data);
                if (response.status === 401) {
                    return Promise.reject(response.data);
                }

            } else if (response.status >= 500) {
                console.error('Server Error:', response.status, response.data);
                return Promise.reject(response.data);
            }

            return response;
        },
        (error) => {
            if (error.message === 'Network Error') {
                console.error('Network Error:', error);
            } else if (error.response) {
                console.error('HTTP Error:', error.response.status, error.response.data);
            } else {
                console.error('Error:', error);
            }

            return Promise.reject(error);
        }
    );

    return instance;
};

export {createAxiosInstance, BASE_URL};
