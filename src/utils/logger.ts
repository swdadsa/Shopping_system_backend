import winston from 'winston';

export class logger {
    Date = new Date();
    today = this.Date.getFullYear() + '-' + (this.Date.getMonth() + 1) + '-' + this.Date.getDate();

    logger = winston

    error(message: any) {
        this.logger.createLogger({
            level: 'error',
            format: winston.format.combine(
                winston.format.timestamp(),
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