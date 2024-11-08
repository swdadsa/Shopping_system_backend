import winston from 'winston';

export class logger {
    Date = new Date();
    today = this.Date.getFullYear() + '-' + (this.Date.getMonth() + 1) + '-' + this.Date.getDate();

    logger = winston

    error(message: any) {
        let time = this.Date.getFullYear() + '-' + (this.Date.getMonth() + 1) + '-' + this.Date.getDate() + ' ' + this.Date.getHours() + ':' + this.Date.getMinutes() + ':' + this.Date.getSeconds();
        this.logger.createLogger({
            level: 'error',
            format: winston.format.combine(
                winston.format.timestamp({
                    format: () => {
                        const now = new Date();
                        // 格式化為本地時間 "YYYY-MM-DD HH:mm:ss"
                        return now.toLocaleString('zh-TW', {
                            timeZone: 'Asia/Taipei',
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                        }).replace(/\//g, '-');  // 替換斜線為破折號
                    }
                }),
                winston.format.printf(({ timestamp, level, message }) => {
                    return `[${timestamp}] ${level}: ${message}`;
                }),
                winston.format.json()
            ),
            transports: [
                new winston.transports.File({ filename: './src/log/error_' + this.today + '.log' })
            ]
        }).error(message);
    }

    info(message: any) {
        this.logger.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            transports: [
                new winston.transports.File({ filename: './src/log/info_' + this.today + '.log' })
            ]
        }).info(message);
    }
}