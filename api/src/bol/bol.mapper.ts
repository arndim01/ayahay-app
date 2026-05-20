export class BolMapper {
  mapBol(data: any): any {
    return {
      bols: data.bols.map((bol: any) => ({
        cargos: bol.cargos.map((cargo: any) => ({
          weight: cargo.weight,
          description: cargo.description,
          ticket_price: typeof cargo.ticket_price === 'number' 
            ? cargo.ticket_price.toFixed(2) 
            : (parseFloat(cargo.ticket_price) || 0).toFixed(2),
          classification: cargo.classification,
        })),
        consignee: bol.consignee,
        destination: bol.destination,
        vessel_name: bol.vessel_name,
        total_amount: typeof bol.total_amount === 'number' 
          ? bol.total_amount.toFixed(2) 
          : (parseFloat(bol.total_amount) || 0).toFixed(2),
        departure_date: bol.departure_date,
        reference_number: bol.reference_number,
        shipping_line_name: bol.shipping_line_name,
        shipping_line_tel_no: bol.shipping_line_tel_no,
        shipping_line_address: bol.shipping_line_address,
      })),
    };
  }
}
