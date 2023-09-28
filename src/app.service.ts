import { Injectable, Logger } from "@nestjs/common";
import { UserService } from "./user/user.service";

/**
 * Every 10 seconds interval
 */
const EVERY_10_SECONDS_INTERVAL = 10000;

/**
 * Every hour interval
 */
const EVERY_HOUR_INTERVAL = 1000 * 60 * 1;

/**
 * Service for App
 */
@Injectable()
export class AppService {
    /**
     * Constructor for AppService
     * @param mailNotificationService Injected MailNotificationService
     */
    constructor(private readonly userService: UserService) {
        /**
         * Schedule sending pending emails
         * setInterval is used here instead of cron based @nestjs/schedule because of cron package vulnerability
         */
    }

    /**
     * Interval ref for pending mail
     */
    intervalRef;

    /**
     * Hourly interval ref
     */
    hourlyIntervalRef;

    /**
     * Determines whether pending mail is running
     */
    private isPendingMailRunning = false;

    /**
     * Determines whether inactivity check is running
     */
    private isInactivityCheckRunning = false;

    /**
     * Send pending mails
     */
    async sendPendingMail() {
        if (!this.isPendingMailRunning) {
            try {
                this.isPendingMailRunning = true;
            } catch (error) {
                Logger.error(error);
            } finally {
                this.isPendingMailRunning = false;
            }
        }
    }

    /**
     * Clear pending intervals
     */
    async clearPendingIntervals() {
        clearInterval(this.intervalRef);
        clearInterval(this.hourlyIntervalRef);
    }
}
