'use client';
import React, { useState, useEffect, ReactNode } from 'react';
import { IPort, IShip, IShippingLineSchedule, ITrip } from '@ayahay/models';
import {
  Button,
  DatePicker,
  Form,
  notification,
  Select,
  TimePicker,
  Typography,
  Table,
  Space,
  Checkbox,
  Card,
  Divider,
  Modal,
} from 'antd';
import type { CheckboxProps, CheckboxGroupProps } from 'antd/es/checkbox';
import type { FormInstance } from 'antd/es/form';
import type { RangePickerProps } from 'antd/es/date-picker';
import type { SelectProps } from 'antd/es/select';
import type { TimePickerProps } from 'antd/es/time-picker';
import type { SpaceProps } from 'antd/es/space';
import type { BaseOptionType, DefaultOptionType } from 'antd/es/select';
import type { DatePickerProps } from 'antd/es/date-picker';
import type { TableProps } from 'antd/es/table';
import type { CardProps } from 'antd/es/card';
import type { DividerProps } from 'antd/es/divider';
import type { ButtonProps } from 'antd/es/button';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { CreateTripsFromSchedulesRequest } from '@ayahay/http';
import {
  createTripsFromSchedules,
  validateTrips,
} from '@/services/trip.service';
import { getAxiosError } from '@ayahay/services/error.service';
import { getPortsByShippingLine } from '@/services/shipping-line.service';
import { getShipsOfMyShippingLine } from '@/services/ship.service';
import dayjs, { Dayjs } from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import { useAuth } from '@/contexts/AuthContext';
import { z, ZodError } from 'zod';
import { AxiosError } from 'axios';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import axios from '@ayahay/services/axios';

// Initialize dayjs extensions
dayjs.extend(isSameOrBefore);

interface BookingCutoff {
  shippingLineId: number;
  originId: number;
  destinationId: number;
  cutOffConditionType: string;
  cutOffValue: number;
  id?: number;
  shipping_line_id?: number;
  origin?: number;
  destination?: number;
  cut_off_condition_type?: string;
  cut_off_value?: number;
}

interface CreateTripsFromScheduleFormProps {
  schedules: IShippingLineSchedule[];
}

interface TableSchedule {
  key: number;
  dateRange: [Dayjs, Dayjs];
  origin: number;
  destination: number;
  departureTime: Dayjs;
  vessel: number;
  repeatOn: string[];
  validationErrors?: Record<string, string>;
  scheduleId?: number;
}

interface FormValues {
  schedules: TableSchedule[];
}

interface ValidationError {
  message: string;
  path: (string | number)[];
}

// New interfaces for tracking trip creation results
interface TripCreationResult {
  scheduleId: number;
  originName?: string;
  destinationName?: string;
  departureDateIso: string;
  departureDate?: string; // Human-readable date
  vesselName?: string;
  status: 'success' | 'failed';
  reason?: string;
}

// Cast components to any to bypass TypeScript errors while maintaining functionality
const AntRangePicker = DatePicker.RangePicker as any;
const AntSelect = Select as any;
const AntOption = Select.Option as any;
const AntTimePicker = TimePicker as any;
const AntCheckboxGroup = Checkbox.Group as any;
const AntSpace = Space as any;
const AntButton = Button as any;
const AntCard = Card as any;
const AntDivider = Divider as any;
const AntTitle = Typography.Title as any;
const AntTable = Table as any;
const AntModal = Modal as any;

const { RangePicker } = DatePicker as any;
const { Title } = Typography;
const { Option } = Select as any;

const daysOfWeek: { label: string; value: string }[] = [
  { label: 'Sun', value: 'Sun' },
  { label: 'Mon', value: 'Mon' },
  { label: 'Tue', value: 'Tue' },
  { label: 'Wed', value: 'Wed' },
  { label: 'Thu', value: 'Thu' },
  { label: 'Fri', value: 'Fri' },
  { label: 'Sat', value: 'Sat' },
];

const allDays = daysOfWeek.map((day) => day.value);
const weekdaysOnly = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const weekendsOnly = ['Sun', 'Sat'];

const scheduleSchema = z.object({
  scheduleId: z.number({
    required_error: 'Schedule ID is required',
    invalid_type_error: 'Schedule ID must be a number',
  }),
  override: z.object({
    departureDateIso: z.string().optional(),
    srcPortId: z.number({
      required_error: 'Source port is required',
      invalid_type_error: 'Source port must be a number',
    }),
    destPortId: z.number({
      required_error: 'Destination port is required',
      invalid_type_error: 'Destination port must be a number',
    }),
    shipId: z.number({
      required_error: 'Ship is required',
      invalid_type_error: 'Ship must be a number',
    }),
  }),
});

const createTripsRequestSchema = z.object({
  schedules: z
    .array(scheduleSchema)
    .min(1, 'At least one schedule is required'),
  dateRanges: z
    .array(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .min(1, 'At least one date range is required'),
});

type CreateTripsRequest = z.infer<typeof createTripsRequestSchema>;

// Cast icon components to any to bypass TypeScript errors
const AntDeleteOutlined = DeleteOutlined as any;
const AntPlusOutlined = PlusOutlined as any;

// Add this type for schedule pairs
interface PortPair {
  originId: number;
  destinationId: number;
  originName: string;
  destinationName: string;
  scheduleId: number;
  shipId: number;
  departureHour: number;
  departureMinute: number;
}

const mapFormToRequest = (
  tableData: TableSchedule[],
  schedules: IShippingLineSchedule[],
  ships: IShip[]
): CreateTripsFromSchedulesRequest => {
  const mappedSchedules = tableData.map((schedule) => {
    if (!schedule.dateRange?.[0] || !schedule.dateRange?.[1]) {
      throw new Error(
        `Date range is required for schedule ${schedule.key + 1}`
      );
    }
    if (!schedule.origin) {
      throw new Error(
        `Origin port is required for schedule ${schedule.key + 1}`
      );
    }
    if (!schedule.destination) {
      throw new Error(
        `Destination port is required for schedule ${schedule.key + 1}`
      );
    }
    if (!schedule.vessel) {
      throw new Error(`Vessel is required for schedule ${schedule.key + 1}`);
    }
    if (!schedule.departureTime) {
      throw new Error(
        `Departure time is required for schedule ${schedule.key + 1}`
      );
    }

    // Find the matching schedule from the API data based on origin and destination
    const matchingSchedule = schedules.find(
      (s) =>
        s.srcPort?.id === schedule.origin &&
        s.destPort?.id === schedule.destination
    );

    if (!matchingSchedule) {
      throw new Error(
        `Could not find a matching schedule for the origin (${schedule.origin}) and destination (${schedule.destination}).`
      );
    }

    // Calculate departure date with the specified time
    const departureHour = schedule.departureTime.hour();
    const departureMinute = schedule.departureTime.minute();
    const departureDateIso = schedule.dateRange[0]
      .clone()
      .hour(departureHour)
      .minute(departureMinute)
      .second(0)
      .toISOString();

    // Create the schedule request
    return {
      scheduleId: matchingSchedule.id,
      override: {
        srcPortId: schedule.origin,
        destPortId: schedule.destination,
        departureDateIso,
        shipId: schedule.vessel,
      },
    };
  });

  // Process the date ranges - importantly, extract UNIQUE dates
  // This will ensure that when start and end dates are the same, it's only processed once
  const dateRanges = tableData.reduce((uniqueDateRanges, schedule) => {
    if (
      !schedule.dateRange ||
      !schedule.dateRange[0] ||
      !schedule.dateRange[1]
    ) {
      return uniqueDateRanges;
    }

    const startDate = schedule.dateRange[0].format('YYYY-MM-DD');
    const endDate = schedule.dateRange[1].format('YYYY-MM-DD');
    const repeatDays = schedule.repeatOn || [];

    // If start and end date are the same, create just a single-day range
    if (startDate === endDate) {
      // Check if we already have this exact date range
      const existingRange = uniqueDateRanges.find(
        (range) =>
          range.startDate === startDate &&
          range.endDate === endDate &&
          JSON.stringify(range.repeatDays.sort()) ===
            JSON.stringify(repeatDays.sort())
      );

      if (!existingRange) {
        uniqueDateRanges.push({
          startDate,
          endDate,
          repeatDays,
        });
      }
    } else {
      // For multi-day ranges, add as normal
      const existingRange = uniqueDateRanges.find(
        (range) =>
          range.startDate === startDate &&
          range.endDate === endDate &&
          JSON.stringify(range.repeatDays.sort()) ===
            JSON.stringify(repeatDays.sort())
      );

      if (!existingRange) {
        uniqueDateRanges.push({
          startDate,
          endDate,
          repeatDays,
        });
      }
    }

    return uniqueDateRanges;
  }, [] as { startDate: string; endDate: string; repeatDays: string[] }[]);

  // Create the final request
  const result: CreateTripsFromSchedulesRequest = {
    schedules: mappedSchedules,
    dateRanges,
  };

  return result;
};

// API function to fetch booking cutoffs
const fetchBookingCutoffs = async (
  shippingLineId: number
): Promise<BookingCutoff[]> => {
  try {
    // Using pre-configured axios from @ayahay/services/axios which includes auth headers
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const { data } = await axios.get(
      `${API_URL}/preference/booking-cutoff?shippingLineId=${shippingLineId}`
    );

    if (!data || data.length === 0) {
      console.log('No booking cutoffs found in the API');
    }

    // Transform the API response to match our interface
    return (data || []).map((item: any) => ({
      id: item.id,
      shippingLineId: item.shipping_line_id,
      originId: item.origin,
      destinationId: item.destination,
      cutOffConditionType: item.cut_off_condition_type,
      cutOffValue: item.cut_off_value,
    }));
  } catch (error) {
    console.error('Error fetching booking cutoffs');
    return []; // Return empty array, but don't use mock data
  }
};

export const CreateTripsFromScheduleForm: React.FC<
  CreateTripsFromScheduleFormProps
> = ({ schedules }) => {
  const { loggedInAccount } = useAuth();
  const [form] = Form.useForm<FormValues>();
  const [api, contextHolder] = notification.useNotification();
  const [isCreatingTrips, setIsCreatingTrips] = useState(false);
  const [tableData, setTableData] = useState<TableSchedule[]>([]);
  const [ports, setPorts] = useState<IPort[]>([]);
  const [ships, setShips] = useState<IShip[]>([]);
  const [portPairs, setPortPairs] = useState<PortPair[]>([]);
  const [bookingCutoffs, setBookingCutoffs] = useState<BookingCutoff[]>([]);

  // New state variables for the result modal
  const [tripCreationResults, setTripCreationResults] = useState<
    TripCreationResult[]
  >([]);
  const [isResultModalVisible, setIsResultModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    if (!loggedInAccount?.shippingLineId) {
      console.error('No shipping line ID available in logged in account');
      return;
    }

    try {
      // Remove sensitive logging
      setIsLoading(true);

      const [portsData, shipsData, bookingCutoffsData] = await Promise.all([
        getPortsByShippingLine(loggedInAccount.shippingLineId),
        getShipsOfMyShippingLine(),
        fetchBookingCutoffs(loggedInAccount.shippingLineId),
      ]);

      // Remove sensitive data from logs
      console.log('Data fetch complete');

      if (portsData) {
        setPorts(portsData);

        // Create port pairs from schedules
        const pairs: PortPair[] = schedules
          .filter(
            (schedule) => schedule.srcPort && schedule.destPort && schedule.ship
          )
          .map((schedule) => ({
            originId: schedule.srcPort!.id,
            destinationId: schedule.destPort!.id,
            originName: schedule.srcPort!.name,
            destinationName: schedule.destPort!.name,
            scheduleId: schedule.id,
            shipId: schedule.ship!.id,
            departureHour: schedule.departureHour,
            departureMinute: schedule.departureMinute,
          }));
        setPortPairs(pairs);

        // Set booking cutoffs from API
        setBookingCutoffs(bookingCutoffsData || []);
      } else {
        console.error('No ports data received');
        api.warning({
          message: 'Data Loading Warning',
          description:
            'Could not load ports data. Some functionality may be limited.',
        });
      }

      if (shipsData && shipsData.length > 0) {
        // Remove sensitive data
        console.log('Ships data loaded');
        setShips(shipsData);
      } else {
        console.error('No ships data received');
        api.warning({
          message: 'Data Loading Warning',
          description:
            'Could not load ships data. Some functionality may be limited.',
        });
      }
    } catch (error) {
      console.error('Error fetching data');
      api.error({
        message: 'Data Loading Error',
        description: 'Could not load required data. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [loggedInAccount?.shippingLineId, schedules]);

  // Format military time properly
  const formatMilitaryTime = (timeValue: number | string): string => {
    if (timeValue === undefined || timeValue === null) return '0000';

    // Convert to string
    let timeStr = String(timeValue);

    // If only hours are provided (e.g. "13"), add "00" for minutes
    if (timeStr.length <= 2) {
      return timeStr.padStart(2, '0') + '00';
    }

    // If it's already in a reasonable format, pad to ensure 4 digits
    return timeStr.padStart(4, '0');
  };

  // Parse military time string to get hours and minutes
  const parseMilitaryTime = (
    timeStr: string
  ): { hours: number; minutes: number } => {
    // Make sure we have a 4-digit string
    const paddedTime = formatMilitaryTime(timeStr);

    // Extract hours and minutes
    const hours = parseInt(paddedTime.substring(0, 2), 10);
    const minutes = parseInt(paddedTime.substring(2, 4), 10);

    // Validate values
    return {
      hours: Math.min(Math.max(hours, 0), 23),
      minutes: Math.min(Math.max(minutes, 0), 59),
    };
  };

  const onSubmitForm = async (formValues: FormValues) => {
    try {
      console.log('Starting form submission...');

      // Check if ships is loaded correctly
      if (!ships || ships.length === 0) {
        api.error({
          message: 'Initialization Error',
          description:
            'Vessels (ships) data is not loaded. Please try refreshing the page.',
        });
        return;
      }

      await form.validateFields();
      console.log('Form validation passed');

      // Clear any validation errors
      setTableData(
        tableData.map((schedule) => ({
          ...schedule,
          validationErrors: {},
        }))
      );

      if (tableData.length === 0) {
        api.error({
          message: 'Validation Error',
          description: 'Please add at least one schedule',
        });
        return;
      }

      try {
        // Create the request only once
        const requestPayload = mapFormToRequest(tableData, schedules, ships);
        console.log('Request prepared');

        const validationResult =
          createTripsRequestSchema.safeParse(requestPayload);
        if (!validationResult.success) {
          const errors = validationResult.error.issues.map((issue) => ({
            message: issue.message,
            path: issue.path,
          }));
          console.error('Zod validation failed:', errors);

          const newTableData = [...tableData];
          errors.forEach((error) => {
            const scheduleIndex = error.path[1] as number;
            if (scheduleIndex !== undefined) {
              if (!newTableData[scheduleIndex].validationErrors) {
                newTableData[scheduleIndex].validationErrors = {};
              }
              const field = error.path[error.path.length - 1] as string;
              newTableData[scheduleIndex].validationErrors[field] =
                error.message;
            }
          });
          setTableData(newTableData);

          api.error({
            message: 'Validation Error',
            description: errors
              .map((err) => `${err.path.join('.')}: ${err.message}`)
              .join('\n'),
          });
          return;
        }

        setIsCreatingTrips(true);

        // First validate the trips
        const validationResponse = await validateTrips(validationResult.data);

        if (!validationResponse.valid && validationResponse.errors) {
          console.log('Validation failed:', validationResponse.errors);

          // Process validation errors
          const failedResults: TripCreationResult[] = [];

          // Look for global errors (scheduleId: 0)
          const globalErrors: string[] = [];

          // Group errors by schedule ID
          const errorsByScheduleId = new Map<number, string[]>();
          validationResponse.errors.forEach((error) => {
            if (error.scheduleId === 0) {
              // This is a global error that applies to all schedules
              globalErrors.push(error.message);
            } else {
              if (!errorsByScheduleId.has(error.scheduleId)) {
                errorsByScheduleId.set(error.scheduleId, []);
              }
              errorsByScheduleId.get(error.scheduleId)!.push(error.message);
            }
          });

          // If we have global errors, apply them to all schedules
          if (globalErrors.length > 0) {
            requestPayload.schedules.forEach((schedule) => {
              if (!errorsByScheduleId.has(schedule.scheduleId)) {
                errorsByScheduleId.set(schedule.scheduleId, []);
              }
              globalErrors.forEach((error) => {
                errorsByScheduleId.get(schedule.scheduleId)!.push(error);
              });
            });
          }

          // Create failure entries for schedules with specific errors
          requestPayload.schedules.forEach((schedule, index) => {
            const scheduleId = schedule.scheduleId;
            const scheduleErrors = errorsByScheduleId.get(scheduleId);

            // Skip schedules with no errors (should not happen now with global errors)
            if (!scheduleErrors || scheduleErrors.length === 0) {
              return;
            }

            const vessel = ships.find(
              (ship) => ship.id === schedule.override?.shipId
            );
            const sourcePort = ports.find(
              (port) => port.id === schedule.override?.srcPortId
            );
            const destPort = ports.find(
              (port) => port.id === schedule.override?.destPortId
            );

            // Get the original schedule data to access the repeatDays
            const tableSchedule = tableData[index];
            const repeatDays = tableSchedule.repeatOn || [];

            // Process all date ranges
            requestPayload.dateRanges.forEach((dateRange) => {
              const startDate = dayjs(dateRange.startDate);
              const endDate = dayjs(dateRange.endDate);

              // For each day in the range
              for (
                let date = startDate.clone();
                date.isSameOrBefore(endDate);
                date = date.add(1, 'day')
              ) {
                // Get the day of the week
                const dayOfWeek = date.format('ddd');

                // If repeat days were specified and this day isn't included, skip it
                if (repeatDays.length > 0 && !repeatDays.includes(dayOfWeek)) {
                  continue;
                }

                // Format the departure date and time
                const departureTimeObj = dayjs(
                  schedule.override?.departureDateIso
                );
                const departureDate = date
                  .clone()
                  .hour(departureTimeObj.hour())
                  .minute(departureTimeObj.minute());

                // Mark this specific trip as failed with its specific error
                failedResults.push({
                  scheduleId: schedule.scheduleId,
                  originName: sourcePort?.name || '',
                  destinationName: destPort?.name || '',
                  departureDateIso: departureDate.toISOString(),
                  departureDate: date.format('MMM DD, YYYY'),
                  vesselName: vessel?.name || '',
                  status: 'failed',
                  reason: scheduleErrors.join('; '),
                });
              }
            });
          });

          if (failedResults.length > 0) {
            setTripCreationResults(failedResults);
            setIsResultModalVisible(true);

            api.error({
              message: 'Validation Failed',
              description:
                globalErrors.length > 0
                  ? globalErrors.join('; ')
                  : 'Trip validation detected scheduling conflicts for some trips. No trips were created.',
            });
          } else {
            // This should not happen now, but handle it just in case
            api.error({
              message: 'Validation Failed',
              description:
                'Trip validation failed, but no specific errors were provided.',
            });
          }

          return;
        }

        // If validation passed, proceed with creating the trips
        const result = await createTripsFromSchedules(validationResult.data);

        if (result === undefined) {
          // All trips created successfully - process results

          // Track unique trips to avoid duplicates
          const uniqueTrips = new Map<string, TripCreationResult>();

          // Process each schedule
          requestPayload.schedules.forEach((schedule, scheduleIndex) => {
            const vessel = ships.find(
              (ship) => ship.id === schedule.override?.shipId
            );
            const sourcePort = ports.find(
              (port) => port.id === schedule.override?.srcPortId
            );
            const destPort = ports.find(
              (port) => port.id === schedule.override?.destPortId
            );
            const tableSchedule = tableData[scheduleIndex];
            const repeatDays = tableSchedule.repeatOn || [];

            // Process each date range
            requestPayload.dateRanges.forEach((dateRange) => {
              const startDate = dayjs(dateRange.startDate);
              const endDate = dayjs(dateRange.endDate);

              // Process dates in range
              // If start === end, this will run exactly once
              for (
                let date = startDate.clone();
                date.isSameOrBefore(endDate, 'day');
                date = date.add(1, 'day')
              ) {
                // Skip if this day isn't in repeat days
                const dayOfWeek = date.format('ddd');
                if (repeatDays.length > 0 && !repeatDays.includes(dayOfWeek)) {
                  continue;
                }

                // Build departure date and time
                const departureHour = tableSchedule.departureTime?.hour() || 0;
                const departureMinute =
                  tableSchedule.departureTime?.minute() || 0;
                const departureDate = date
                  .clone()
                  .hour(departureHour)
                  .minute(departureMinute);

                // Create a unique key for this trip
                const tripKey = `${sourcePort?.id}-${destPort?.id}-${
                  vessel?.id
                }-${departureDate.format('YYYY-MM-DD-HH-mm')}`;

                // Only add if we haven't processed this exact trip yet
                if (!uniqueTrips.has(tripKey)) {
                  uniqueTrips.set(tripKey, {
                    scheduleId: schedule.scheduleId,
                    originName: sourcePort?.name || '',
                    destinationName: destPort?.name || '',
                    departureDateIso: departureDate.toISOString(),
                    departureDate: date.format('MMM DD, YYYY'),
                    vesselName: vessel?.name || '',
                    status: 'success',
                  });
                }
              }
            });
          });

          // Convert the Map values to an array
          const successResults = Array.from(uniqueTrips.values());

          setTripCreationResults(successResults);
          setIsResultModalVisible(true);

          form.resetFields();
          setTableData([]);

          api.success({
            message: 'Success',
            description: 'All trips were created successfully!',
          });
        } else {
          // Handle the error
          console.error('Error creating trips:', result);

          // Process the error response
          let allResults: TripCreationResult[] = [];
          let errorMessage = 'Unknown error occurred';

          if (result instanceof AxiosError && result.response?.data) {
            errorMessage = result.response.data.message || errorMessage;
            console.log('Error response data:', result.response.data);

            // Parse detailed validation errors and mark specific schedules as failed
            if (
              errorMessage.includes(
                'Validation failed for one or more schedules'
              ) ||
              errorMessage.includes('Some trips could not be created')
            ) {
              console.log('Detailed validation error detected');

              // Extract schedule-specific errors
              const scheduleErrorPattern =
                /Schedule ID (\d+) has the following conflicts:/g;
              const conflictErrorPattern =
                /Conflict: Vessel "([^"]+)" is already scheduled for the route ([^"]+) to ([^"]+) at ([^"]+)/g;
              const scheduleErrorMatches = Array.from(
                errorMessage.matchAll(scheduleErrorPattern)
              );
              const conflictErrorMatches = Array.from(
                errorMessage.matchAll(conflictErrorPattern)
              );

              console.log('Matched schedule errors:', scheduleErrorMatches);
              console.log('Matched conflict errors:', conflictErrorMatches);

              // If we found schedule-specific errors
              if (
                scheduleErrorMatches.length > 0 ||
                conflictErrorMatches.length > 0
              ) {
                const errorsByScheduleId = new Map<number, string[]>();
                const processedSchedules = new Set<number>();

                // Extract the error messages for each schedule
                scheduleErrorMatches.forEach((match) => {
                  const scheduleId = parseInt(match[1]);
                  processedSchedules.add(scheduleId);
                  const startIndex = match.index! + match[0].length;

                  // Find the next schedule error or end of string
                  const nextMatch = scheduleErrorMatches.find(
                    (m) => m.index! > match.index!
                  );
                  const endIndex = nextMatch
                    ? nextMatch.index!
                    : errorMessage.length;

                  // Extract error messages (lines starting with "- ")
                  const errorSection = errorMessage.substring(
                    startIndex,
                    endIndex
                  );
                  const errorLines = errorSection
                    .split('\n')
                    .filter((line) => line.trim().startsWith('- '))
                    .map((line) => line.trim().substring(2));

                  errorsByScheduleId.set(scheduleId, errorLines);
                });

                console.log(
                  'Parsed errors by schedule ID:',
                  errorsByScheduleId
                );

                // Create entries for each schedule, both failed and successful
                requestPayload.schedules.forEach((schedule, index) => {
                  const scheduleId = schedule.scheduleId;
                  const scheduleErrors = errorsByScheduleId.get(scheduleId);
                  const hasErrors = scheduleErrors && scheduleErrors.length > 0;

                  const vessel = ships.find(
                    (ship) => ship.id === schedule.override?.shipId
                  );
                  const sourcePort = ports.find(
                    (port) => port.id === schedule.override?.srcPortId
                  );
                  const destPort = ports.find(
                    (port) => port.id === schedule.override?.destPortId
                  );

                  // Get the original schedule data to access the repeatDays
                  const tableSchedule = tableData[index];
                  const repeatDays = tableSchedule.repeatOn || [];

                  // Process all date ranges and create entries for each attempted trip
                  requestPayload.dateRanges.forEach((dateRange) => {
                    const startDate = dayjs(dateRange.startDate);
                    const endDate = dayjs(dateRange.endDate);

                    // For each day in the range
                    for (
                      let date = startDate.clone();
                      date.isSameOrBefore(endDate);
                      date = date.add(1, 'day')
                    ) {
                      // Get the day of the week
                      const dayOfWeek = date.format('ddd');

                      // If repeat days were specified and this day isn't included, skip it
                      if (
                        repeatDays.length > 0 &&
                        !repeatDays.includes(dayOfWeek)
                      ) {
                        continue;
                      }

                      // Format the departure date and time
                      const departureTimeObj = dayjs(
                        schedule.override?.departureDateIso
                      );
                      const departureDate = date
                        .clone()
                        .hour(departureTimeObj.hour())
                        .minute(departureTimeObj.minute());

                      // Format for comparison
                      const departureDateTimeStr = departureDate.format(
                        'M/D/YYYY, h:mm:ss A'
                      );

                      // Check if this specific trip has a conflict error
                      let hasConflict = false;
                      let conflictReason = '';

                      if (sourcePort && destPort && vessel) {
                        for (const conflictMatch of conflictErrorMatches) {
                          const conflictVessel = conflictMatch[1];
                          const conflictOrigin = conflictMatch[2];
                          const conflictDest = conflictMatch[3];
                          const conflictDateTime = conflictMatch[4];

                          // Check if this is the conflicting trip
                          if (
                            vessel.name === conflictVessel &&
                            sourcePort.name === conflictOrigin &&
                            destPort.name === conflictDest &&
                            conflictDateTime.includes(
                              departureDateTimeStr.split(',')[0]
                            )
                          ) {
                            hasConflict = true;
                            conflictReason = `Conflict: Vessel "${conflictVessel}" is already scheduled for the route ${conflictOrigin} to ${conflictDest} at ${conflictDateTime}`;
                            break;
                          }
                        }
                      }

                      // Add this trip with appropriate status
                      allResults.push({
                        scheduleId: schedule.scheduleId,
                        originName: sourcePort?.name || '',
                        destinationName: destPort?.name || '',
                        departureDateIso: departureDate.toISOString(),
                        departureDate: date.format('MMM DD, YYYY'),
                        vesselName: vessel?.name || '',
                        status: hasErrors || hasConflict ? 'failed' : 'success',
                        reason: hasConflict
                          ? conflictReason
                          : hasErrors
                          ? scheduleErrors.join('; ')
                          : undefined,
                      });
                    }
                  });
                });
              } else {
                // If we couldn't extract schedule-specific errors, generate results for all
                allResults = generateMixedResultsForAllSchedules(
                  requestPayload,
                  errorMessage
                );
              }
            } else if (
              errorMessage.includes(
                'One or more trips in the specified date range already exist'
              )
            ) {
              // Handle the existing trips error
              allResults = generateMixedResultsForAllSchedules(
                requestPayload,
                'Trip already exists'
              );
            } else {
              // Handle general error
              allResults = generateMixedResultsForAllSchedules(
                requestPayload,
                errorMessage
              );
            }
          } else if (result instanceof Error) {
            // Handle regular Error objects
            errorMessage = result.message;
            allResults = generateMixedResultsForAllSchedules(
              requestPayload,
              errorMessage
            );
          }

          setTripCreationResults(allResults);
          setIsResultModalVisible(true);

          api.error({
            message: 'Some Trips Could Not Be Created',
            description:
              'Please check the results for details on which trips failed and why.',
          });
        }
      } catch (error) {
        console.error('Error preparing request');
        api.error({
          message: 'Request Preparation Error',
          description:
            error instanceof Error
              ? error.message
              : 'An error occurred while preparing the request. Check that all required fields are filled correctly.',
        });
        setIsCreatingTrips(false);
      }
    } catch (error) {
      console.error('Form validation error');
      api.error({
        message: 'Form Validation Error',
        description:
          error instanceof Error
            ? error.message
            : 'Please check that all required fields are filled correctly.',
      });
    } finally {
      setIsCreatingTrips(false);
    }
  };

  // Update the generateMixedResultsForAllSchedules function
  const generateMixedResultsForAllSchedules = (
    request: CreateTripsFromSchedulesRequest,
    errorMessage: string
  ): TripCreationResult[] => {
    const uniqueTrips = new Map<string, TripCreationResult>();

    request.schedules.forEach((schedule, scheduleIndex) => {
      const vessel = ships.find(
        (ship) => ship.id === schedule.override?.shipId
      );
      const sourcePort = ports.find(
        (port) => port.id === schedule.override?.srcPortId
      );
      const destPort = ports.find(
        (port) => port.id === schedule.override?.destPortId
      );

      if (scheduleIndex >= tableData.length) return;
      const tableSchedule = tableData[scheduleIndex];
      const repeatDays = tableSchedule.repeatOn || [];

      // Skip if no date range
      if (!tableSchedule.dateRange?.[0] || !tableSchedule.dateRange?.[1]) {
        return;
      }

      // Process each date range
      request.dateRanges.forEach((dateRange) => {
        const startDate = dayjs(dateRange.startDate);
        const endDate = dayjs(dateRange.endDate);

        // Process dates in range (will be exactly one iteration if start === end)
        for (
          let date = startDate.clone();
          date.isSameOrBefore(endDate, 'day');
          date = date.add(1, 'day')
        ) {
          // Skip if this day isn't in repeat days
          const dayOfWeek = date.format('ddd');
          if (repeatDays.length > 0 && !repeatDays.includes(dayOfWeek)) {
            continue;
          }

          // Build departure date and time
          const departureHour = tableSchedule.departureTime?.hour() || 0;
          const departureMinute = tableSchedule.departureTime?.minute() || 0;
          const departureDate = date
            .clone()
            .hour(departureHour)
            .minute(departureMinute);

          // Create unique trip key
          const tripKey = `${sourcePort?.id}-${destPort?.id}-${
            vessel?.id
          }-${departureDate.format('YYYY-MM-DD-HH-mm')}`;

          // Check for conflicts
          const dateTimeStr = departureDate.format('M/D/YYYY');
          const conflictPattern = new RegExp(
            `Conflict: Vessel "${
              vessel?.name || ''
            }" is already scheduled for the route ${
              sourcePort?.name || ''
            } to ${destPort?.name || ''} at.*${dateTimeStr}`,
            'i'
          );
          const isConflict = errorMessage.match(conflictPattern) !== null;

          // Only add if we haven't processed this exact trip yet
          if (!uniqueTrips.has(tripKey)) {
            uniqueTrips.set(tripKey, {
              scheduleId: schedule.scheduleId,
              originName: sourcePort?.name || '',
              destinationName: destPort?.name || '',
              departureDateIso: departureDate.toISOString(),
              departureDate: date.format('MMM DD, YYYY'),
              vesselName: vessel?.name || '',
              status: isConflict ? 'failed' : 'success',
              reason: isConflict
                ? `Conflict: Vessel "${
                    vessel?.name || ''
                  }" is already scheduled for the route ${
                    sourcePort?.name || ''
                  } to ${destPort?.name || ''} at ${departureDate.format(
                    'MMM D, YYYY, h:mm A'
                  )}`
                : undefined,
            });
          }
        }
      });
    });

    return Array.from(uniqueTrips.values());
  };

  // Keep existing generateFailedResultsForAllSchedules function for backward compatibility
  const generateFailedResultsForAllSchedules = (
    request: CreateTripsFromSchedulesRequest,
    errorMessage: string
  ): TripCreationResult[] => {
    return request.schedules.map((schedule) => {
      const vessel = ships.find(
        (ship) => ship.id === schedule.override?.shipId
      );
      const sourcePort = ports.find(
        (port) => port.id === schedule.override?.srcPortId
      );
      const destPort = ports.find(
        (port) => port.id === schedule.override?.destPortId
      );

      return {
        scheduleId: schedule.scheduleId,
        originName: sourcePort?.name,
        destinationName: destPort?.name,
        departureDateIso: schedule.override?.departureDateIso || '',
        departureDate: dayjs(schedule.override?.departureDateIso).format(
          'MMM DD, YYYY'
        ),
        vesselName: vessel?.name,
        status: 'failed' as const,
        reason: errorMessage,
      };
    });
  };

  const addNewSchedule = () => {
    const newSchedule: TableSchedule = {
      key: tableData.length,
      dateRange: [dayjs(), dayjs()],
      origin: undefined as any,
      destination: undefined as any,
      departureTime: undefined as any,
      vessel: undefined as any,
      repeatOn: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], // Default to all days
    };
    setTableData([...tableData, newSchedule]);
  };

  const removeSchedule = (key: number) => {
    setTableData(tableData.filter((item) => item.key !== key));
  };

  const handleRepeatOptionChange = (key: number, option: string) => {
    const newData = [...tableData];
    const target = newData.find((item) => item.key === key);
    if (target) {
      switch (option) {
        case 'all':
          target.repeatOn = allDays;
          break;
        case 'weekdays':
          target.repeatOn = weekdaysOnly;
          break;
        case 'weekends':
          target.repeatOn = weekendsOnly;
          break;
        case 'none':
          target.repeatOn = [];
          break;
      }
      setTableData(newData);
    }
  };

  // Update the onChange handlers with proper types
  const handleDateRangeChange = (
    record: TableSchedule,
    dates: [Dayjs, Dayjs] | null
  ): void => {
    const newData = [...tableData];
    const target = newData.find((item) => item.key === record.key);
    if (target && dates) {
      target.dateRange = dates;
      target.validationErrors = {
        ...target.validationErrors,
        dateRange: '',
      };
      setTableData(newData);
    }
  };

  const handleOriginChange = (record: TableSchedule, value: number) => {
    const newData = [...tableData];
    const target = newData.find((item) => item.key === record.key);
    if (target) {
      target.origin = value;
      target.destination = undefined as any;
      target.validationErrors = {
        ...target.validationErrors,
        origin: '',
      };
      setTableData(newData);
    }
  };

  const handleDestinationChange = (record: TableSchedule, value: number) => {
    const newData = [...tableData];
    const target = newData.find((item) => item.key === record.key);
    if (target) {
      target.destination = value;
      const matchingPair = portPairs.find(
        (pair) =>
          pair.originId === target.origin && pair.destinationId === value
      );
      if (matchingPair) {
        target.vessel = matchingPair.shipId;
        target.scheduleId = matchingPair.scheduleId;
        target.departureTime = dayjs()
          .hour(matchingPair.departureHour)
          .minute(matchingPair.departureMinute);
      }
      target.validationErrors = {
        ...target.validationErrors,
        destination: '',
      };
      setTableData(newData);
    }
  };

  const handleTimeChange = (
    record: TableSchedule,
    time: Dayjs | null
  ): void => {
    const newData = [...tableData];
    const target = newData.find((item) => item.key === record.key);
    if (target) {
      target.departureTime = time as Dayjs;
      target.validationErrors = {
        ...target.validationErrors,
        departureTime: '',
      };
      setTableData(newData);
    }
  };

  const handleVesselChange = (record: TableSchedule, value: number): void => {
    const newData = [...tableData];
    const target = newData.find((item) => item.key === record.key);
    if (target) {
      target.vessel = value;
      target.validationErrors = {
        ...target.validationErrors,
        vessel: '',
      };
      setTableData(newData);
    }
  };

  const handleRepeatDaysChange = (record: TableSchedule, values: string[]) => {
    const newData = [...tableData];
    const target = newData.find((item) => item.key === record.key);
    if (target) {
      target.repeatOn = values;
      target.validationErrors = {
        ...target.validationErrors,
        repeatOn: '',
      };
      setTableData(newData);
    }
  };

  // Function to get valid destinations for an origin
  const getValidDestinations = (originId: number | undefined): number[] => {
    if (!originId) return [];
    return portPairs
      .filter((pair) => pair.originId === originId)
      .map((pair) => pair.destinationId);
  };

  // Function to calculate booking cut-off time based on departure date and cutoff settings
  const calculateBookingCutoff = (
    originId: number,
    destinationId: number,
    departureDate: Dayjs
  ): string => {
    // Find booking cutoff preference for this route and shipping line
    const cutoff = bookingCutoffs.find(
      (c) =>
        (c.originId === originId || c.origin === originId) &&
        (c.destinationId === destinationId ||
          c.destination === destinationId) &&
        (c.shippingLineId === loggedInAccount?.shippingLineId ||
          c.shipping_line_id === loggedInAccount?.shippingLineId)
    );

    if (!cutoff) {
      // Default: 24 hours before departure
      const cutoffDate = departureDate.clone().subtract(24, 'hour');
      return cutoffDate.format('MMM DD, YYYY hh:mm A');
    }

    // Get the cutoff condition type and value (handling both naming conventions)
    const conditionType =
      cutoff.cutOffConditionType || cutoff.cut_off_condition_type;
    const cutoffValue = cutoff.cutOffValue || cutoff.cut_off_value;

    if (!conditionType || typeof cutoffValue === 'undefined') {
      // Default if data is not available or incomplete
      const cutoffDate = departureDate.clone().subtract(24, 'hour');
      return cutoffDate.format('MMM DD, YYYY hh:mm A');
    }

    if (conditionType === 'number_of_hours') {
      // Number of hours before departure
      const cutoffDate = departureDate.clone().subtract(cutoffValue, 'hour');
      return cutoffDate.format('MMM DD, YYYY hh:mm A');
    } else if (conditionType === 'fixed_hour') {
      // Fixed hour (military time)
      const timeStr = formatMilitaryTime(cutoffValue);
      const { hours, minutes } = parseMilitaryTime(timeStr);

      // Set to the day before departure at the specified time
      const cutoffDate = departureDate
        .clone()
        .subtract(1, 'day')
        .hour(hours)
        .minute(minutes);
      return cutoffDate.format('MMM DD, YYYY hh:mm A');
    }

    // Fallback to default
    const cutoffDate = departureDate.clone().subtract(24, 'hour');
    return cutoffDate.format('MMM DD, YYYY hh:mm A');
  };

  const columns: ColumnsType<TableSchedule> = [
    {
      title: 'Date Range',
      dataIndex: 'dateRange',
      key: 'dateRange',
      width: '20%',
      render: (_, record) => (
        <div>
          <AntRangePicker
            value={record.dateRange}
            onChange={(dates: any) => handleDateRangeChange(record, dates)}
            status={record.validationErrors?.dateRange ? 'error' : undefined}
          />
          {record.validationErrors?.dateRange && (
            <div
              style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}
            >
              {record.validationErrors.dateRange}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Origin',
      dataIndex: 'origin',
      key: 'origin',
      width: '15%',
      render: (_, record) => (
        <div>
          <AntSelect
            placeholder='Select Origin'
            value={record.origin}
            onChange={(value: number) => handleOriginChange(record, value)}
            style={{ width: '100%' }}
            status={record.validationErrors?.origin ? 'error' : undefined}
          >
            {Array.from(new Set(portPairs.map((pair) => pair.originId))).map(
              (originId) => {
                const pair = portPairs.find((p) => p.originId === originId);
                return (
                  <AntOption key={originId} value={originId}>
                    {pair?.originName}
                  </AntOption>
                );
              }
            )}
          </AntSelect>
          {record.validationErrors?.origin && (
            <div
              style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}
            >
              {record.validationErrors.origin}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Destination',
      dataIndex: 'destination',
      key: 'destination',
      width: '15%',
      render: (_, record) => (
        <div>
          <AntSelect
            placeholder='Select Destination'
            value={record.destination}
            onChange={(value: number) => handleDestinationChange(record, value)}
            style={{ width: '100%' }}
            disabled={!record.origin}
            status={record.validationErrors?.destination ? 'error' : undefined}
          >
            {
              /* Convert to array of strings, then to Set to remove duplicates, then back to array of objects */
              Array.from(
                new Set(
                  portPairs
                    .filter((pair) => pair.originId === record.origin)
                    .map((pair) =>
                      JSON.stringify({
                        id: pair.destinationId,
                        name: pair.destinationName,
                      })
                    )
                )
              )
                .map((str: string) => JSON.parse(str))
                .map((dest: { id: number; name: string }) => (
                  <AntOption key={dest.id} value={dest.id}>
                    {dest.name}
                  </AntOption>
                ))
            }
          </AntSelect>
          {record.validationErrors?.destination && (
            <div
              style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}
            >
              {record.validationErrors.destination}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Departure Time',
      dataIndex: 'departureTime',
      key: 'departureTime',
      width: '15%',
      render: (_, record) => (
        <div>
          <AntTimePicker
            format='hh:mm A'
            use12Hours
            value={record.departureTime}
            onChange={(time: Dayjs | null) => handleTimeChange(record, time)}
          />
          {record.origin && record.destination && record.departureTime && (
            <div style={{ fontSize: '12px', marginTop: '4px', color: '#666' }}>
              Booking cutoff:{' '}
              {calculateBookingCutoff(
                record.origin,
                record.destination,
                record.departureTime
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Vessel',
      dataIndex: 'vessel',
      key: 'vessel',
      width: '15%',
      render: (_, record) => (
        <AntSelect
          placeholder='Select Vessel'
          value={record.vessel}
          onChange={(value: any) => handleVesselChange(record, value)}
          style={{ width: '100%' }}
        >
          {ships.map((ship) => (
            <AntOption key={ship.id} value={ship.id}>
              {ship.name}
            </AntOption>
          ))}
        </AntSelect>
      ),
    },
    {
      title: 'Repeat On',
      dataIndex: 'repeatOn',
      key: 'repeatOn',
      width: '15%',
      render: (_, record) => (
        <div>
          <AntSelect
            placeholder='Quick select'
            style={{ width: '100%' }}
            onChange={(value: string) =>
              handleRepeatOptionChange(record.key, value)
            }
            value='all'
          >
            <AntOption value='all'>All Days</AntOption>
            <AntOption value='weekdays'>Weekdays Only</AntOption>
            <AntOption value='weekends'>Weekends Only</AntOption>
            <AntOption value='none'>Clear Selection</AntOption>
          </AntSelect>
          <AntCheckboxGroup
            options={daysOfWeek}
            value={record.repeatOn}
            onChange={(values: string[]) =>
              handleRepeatDaysChange(record, values)
            }
          />
          {record.repeatOn.length > 0 && (
            <div style={{ fontSize: '12px', marginTop: '4px', color: '#666' }}>
              Selected: {record.repeatOn.join(', ')}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: '5%',
      render: (_, record) => (
        <AntButton
          type='text'
          icon={<AntDeleteOutlined />}
          onClick={() => removeSchedule(record.key)}
        />
      ),
    },
  ];

  // Result modal columns
  const resultColumns = [
    {
      title: 'Origin',
      dataIndex: 'originName',
      key: 'originName',
    },
    {
      title: 'Destination',
      dataIndex: 'destinationName',
      key: 'destinationName',
    },
    {
      title: 'Departure Date',
      dataIndex: 'departureDate',
      key: 'departureDate',
    },
    {
      title: 'Departure Time',
      dataIndex: 'departureDateIso',
      key: 'departureDateIso',
      render: (date: string) => dayjs(date).format('hh:mm A'),
    },
    {
      title: 'Vessel',
      dataIndex: 'vesselName',
      key: 'vesselName',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, _record: any) => (
        <span style={{ color: status === 'success' ? 'green' : 'red' }}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      ),
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: 'Booking Cutoff',
      dataIndex: 'bookingCutoff',
      key: 'bookingCutoff',
      render: (_: any, record: TripCreationResult) => {
        if (
          record.originName &&
          record.destinationName &&
          record.departureDateIso
        ) {
          const origin = ports.find((p) => p.name === record.originName)?.id;
          const destination = ports.find(
            (p) => p.name === record.destinationName
          )?.id;
          if (origin && destination) {
            return calculateBookingCutoff(
              origin,
              destination,
              dayjs(record.departureDateIso)
            );
          }
        }
        return '-';
      },
    },
  ];

  // Close the result modal
  const handleModalClose = () => {
    setIsResultModalVisible(false);
  };

  // Keep the data ready check variables
  const shipsLoaded = ships && ships.length > 0;
  const portsLoaded = ports && ports.length > 0;
  const dataReady = shipsLoaded && portsLoaded;

  return (
    <AntCard>
      <AntSpace direction='vertical' size='large' style={{ width: '100%' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <AntTitle level={2} style={{ margin: 0 }}>
            Create Trips Schedule
          </AntTitle>
          <AntButton
            type='primary'
            icon={<AntPlusOutlined />}
            onClick={addNewSchedule}
          >
            Add New Schedule
          </AntButton>
        </div>
        <AntDivider />
        <AntTable
          columns={columns}
          dataSource={tableData}
          pagination={false}
          scroll={{ x: 1200 }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <AntButton
            type='primary'
            onClick={() => onSubmitForm({ schedules: tableData } as any)}
            loading={isCreatingTrips}
            disabled={tableData.length === 0}
          >
            Create Trips
          </AntButton>
        </div>
      </AntSpace>

      {/* Results Modal */}
      <AntModal
        title='Trip Creation Results'
        open={isResultModalVisible}
        onCancel={handleModalClose}
        footer={[
          <AntButton key='close' type='primary' onClick={handleModalClose}>
            Close
          </AntButton>,
        ]}
        width={900}
        bodyStyle={{ maxHeight: '70vh', overflow: 'auto' }}
      >
        {/* Summary Statistics */}
        <div style={{ marginBottom: '20px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderBottom: '1px solid #f0f0f0',
              paddingBottom: '16px',
              marginBottom: '16px',
            }}
          >
            <div>
              <AntTitle level={4} style={{ margin: '0' }}>
                Summary
              </AntTitle>
            </div>
            <div style={{ display: 'flex', gap: '24px' }}>
              <div>
                <div style={{ fontSize: '16px', color: '#8c8c8c' }}>
                  Total Trips
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  {tripCreationResults.length}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '16px', color: '#8c8c8c' }}>
                  Successful
                </div>
                <div
                  style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: 'green',
                  }}
                >
                  {
                    tripCreationResults.filter((r) => r.status === 'success')
                      .length
                  }
                </div>
              </div>
              <div>
                <div style={{ fontSize: '16px', color: '#8c8c8c' }}>Failed</div>
                <div
                  style={{ fontSize: '24px', fontWeight: 'bold', color: 'red' }}
                >
                  {
                    tripCreationResults.filter((r) => r.status === 'failed')
                      .length
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Successful Trips Table */}
        {tripCreationResults.some((r) => r.status === 'success') && (
          <div style={{ marginBottom: '20px' }}>
            <AntTitle
              level={4}
              style={{ margin: '0 0 16px 0', color: 'green' }}
            >
              Successful Trips
            </AntTitle>
            <AntTable
              dataSource={tripCreationResults
                .filter((result) => result.status === 'success')
                .map((result, index) => ({
                  ...result,
                  key: `success-${index}`,
                }))}
              columns={resultColumns.filter((col) => col.key !== 'reason')}
              pagination={{ pageSize: 5 }}
              size='small'
            />
          </div>
        )}

        {/* Failed Trips Table */}
        {tripCreationResults.some((r) => r.status === 'failed') && (
          <div>
            <AntTitle level={4} style={{ margin: '16px 0', color: 'red' }}>
              Failed Trips
            </AntTitle>
            <AntTable
              dataSource={tripCreationResults
                .filter((result) => result.status === 'failed')
                .map((result, index) => ({
                  ...result,
                  key: `failed-${index}`,
                }))}
              columns={resultColumns}
              pagination={{ pageSize: 5 }}
              size='small'
            />
          </div>
        )}

        {/* Show a message if no results */}
        {tripCreationResults.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <div style={{ fontSize: '18px', color: '#8c8c8c' }}>
              No trip creation results to display
            </div>
          </div>
        )}
      </AntModal>

      {contextHolder}
    </AntCard>
  );
};

export default CreateTripsFromScheduleForm;
