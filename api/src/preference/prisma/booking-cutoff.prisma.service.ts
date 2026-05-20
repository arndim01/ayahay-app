import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class BookingCutoffPrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  // CRUD operations for booking cutoff
  async createBookingCutoff(data: any) {
    return this.$queryRaw`
      INSERT INTO preference.booking_cutoff 
      (shipping_line_id, origin, destination, cut_off_condition_type, cut_off_value, created_by, created_at, updated_at)
      VALUES 
      (${data.shipping_line_id}, ${data.origin}, ${data.destination}, 
       ${data.cut_off_condition_type}, ${data.cut_off_value}, ${data.created_by}, 
       timezone('UTC', NOW()), timezone('UTC', NOW()))
      RETURNING *, (
        SELECT name FROM ayahay.shipping_line WHERE id = ${data.shipping_line_id}
      ) as shipping_line_name
    `;
  }

  async findAllBookingCutoffs() {
    return this.$queryRaw`
      SELECT bc.*, 
        sl.name AS shipping_line_name, 
        p_origin.name AS origin_port_name, 
        p_destination.name AS destination_port_name
      FROM preference.booking_cutoff bc
      LEFT JOIN ayahay.shipping_line sl ON bc.shipping_line_id = sl.id
      LEFT JOIN ayahay.port p_origin ON bc.origin = p_origin.id
      LEFT JOIN ayahay.port p_destination ON bc.destination = p_destination.id
      ORDER BY bc.created_at DESC;
    `;
  }

  async findBookingCutoffById(id: number) {
    const result = await this.$queryRaw`
      SELECT bc.*, sl.name as shipping_line_name
      FROM preference.booking_cutoff bc
      LEFT JOIN ayahay.shipping_line sl ON bc.shipping_line_id = sl.id
      WHERE bc.id = ${id}
    `;
    return result[0];
  }

  async updateBookingCutoff(id: number, data: any) {
    return this.$queryRaw`
      UPDATE preference.booking_cutoff 
      SET 
        shipping_line_id = ${data.shipping_line_id},
        origin = ${data.origin},
        destination = ${data.destination},
        cut_off_condition_type = ${data.cut_off_condition_type},
        cut_off_value = ${data.cut_off_value},
        updated_by = ${data.updated_by},
        updated_at = timezone('UTC', NOW())
      WHERE id = ${id}
      RETURNING *, (
        SELECT name FROM ayahay.shipping_line WHERE id = ${data.shipping_line_id}
      ) as shipping_line_name
    `;
  }

  async deleteBookingCutoff(id: number) {
    return this.$queryRaw`
      DELETE FROM preference.booking_cutoff WHERE id = ${id}
    `;
  }
}
