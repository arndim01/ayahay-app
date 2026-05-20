import { Controller, UseGuards } from '@nestjs/common';
import { EmailService } from './email.service';
import { AuthGuard } from '@/auth/auth.guard';
import { Roles } from '@/decorator/roles.decorator';

@Controller('email')
@UseGuards(AuthGuard)
@Roles('ShippingLineStaff', 'ShippingLineAdmin', 'SuperAdmin')
export class EmailController {
  constructor(private emailService: EmailService) {}
}
