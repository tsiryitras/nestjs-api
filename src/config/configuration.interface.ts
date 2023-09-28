import { ConfigType } from '@nestjs/config';
import configuration from './configuration.constant';

/**
 * Dynamic type of configuration
 */
export type ConfigurationType = ConfigType<typeof configuration>;
