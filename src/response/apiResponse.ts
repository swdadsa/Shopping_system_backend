import { logger } from '../utils/logger'

export class apiResponse {
    response(status: boolean, data: any) {
        if (status) {
            return { 'status': 'success', 'data': data }
        } else {
            // 錯誤傳入log
            var classLogger = new logger
            classLogger.error(data);

            return { 'status': 'failed', 'data': data }
        }
    }
}

