// Note: There are React 18 related TSX linter errors in this file that don't affect functionality.
// These are related to the JSX typing in React 18 and occur in many files across the project.
import { IPort } from '@ayahay/models';
import { Form, FormItemProps, Select } from 'antd';
import React, { useEffect, useState } from 'react';
import {
  getPorts,
  getDestinationPorts,
  getPortPairsForShippingLine,
} from '@ayahay/services/port.service';
import { useAuth } from '@/contexts/AuthContext';

const { Option } = Select;

interface PortAutoCompleteProps {
  excludePortId?: string;
  size?: any;
  originPortId?: number;
  isDestination?: boolean;
  validDestinations?: number[];
  shippingLineId?: number;
}

export default function PortAutoComplete({
  excludePortId,
  size,
  originPortId,
  isDestination = false,
  validDestinations,
  shippingLineId: propShippingLineId,
  ...formItemProps
}: PortAutoCompleteProps & FormItemProps) {
  const { loggedInAccount } = useAuth();
  const [allPorts, setAllPorts] = useState([] as IPort[]);
  const [portOptions, setPortOptions] = useState([] as IPort[]);
  const [destinationPorts, setDestinationPorts] = useState<number[]>([]);
  const [portPairs, setPortPairs] = useState<
    { originId: number; destinationId: number }[]
  >([]);

  useEffect(() => {
    initializePorts();

    // If we have a shipping line ID, fetch the valid port pairs
    const shippingLineId =
      propShippingLineId ?? loggedInAccount?.shippingLineId;
    if (shippingLineId) {
      fetchPortPairs(shippingLineId);
    }
  }, [loggedInAccount, propShippingLineId]);

  useEffect(() => {
    // Filter ports when originPortId changes and this is a destination selector
    if (isDestination && originPortId) {
      fetchDestinationPorts();
    }
  }, [originPortId, isDestination, loggedInAccount, propShippingLineId]);

  const fetchPortPairs = async (shippingLineId: number) => {
    // Only fetch port pairs if shippingLineId is provided and not null
    if (!shippingLineId) {
      console.log('No shipping line ID provided, skipping port pairs fetch');
      return;
    }

    const pairs = await getPortPairsForShippingLine(shippingLineId);
    if (pairs && pairs.length > 0) {
      console.log('Port pairs loaded for shipping line:', {
        shippingLineId,
        pairCount: pairs.length,
      });
      setPortPairs(pairs);
    }
  };

  const initializePorts = async () => {
    // Get all ports available for this user
    const shippingLineId =
      propShippingLineId ?? loggedInAccount?.shippingLineId;

    // Log whether we're filtering by shipping line or showing all ports
    console.log('PortAutoComplete - initializePorts:', {
      loggedInAccount,
      propShippingLineId,
      effectiveShippingLineId: shippingLineId,
      showingAllPorts: !shippingLineId,
      props: { excludePortId, isDestination, originPortId },
    });

    // If shippingLineId is null/undefined, getPorts will return all ports
    const ports = (await getPorts(shippingLineId)) ?? [];
    console.log('PortAutoComplete - ports loaded:', {
      portsCount: ports.length,
      portNames: ports.slice(0, 5).map((p) => p.name),
    });
    setAllPorts(ports);
    setPortOptions(ports);
  };

  const fetchDestinationPorts = async () => {
    if (!originPortId) return;

    // Two ways to get valid destinations:
    // 1. Use the API endpoint that specifically returns valid destinations
    // 2. Filter using the port pairs we already fetched

    // Get shipping line ID, which may be null
    const shippingLineId =
      propShippingLineId ?? loggedInAccount?.shippingLineId;

    // If no shipping line ID, we want to show all possible destinations
    if (!shippingLineId) {
      console.log('No shipping line ID, showing all possible destinations');
      setPortOptions(allPorts);
      return;
    }

    // Try using port pairs first if we have them
    if (portPairs.length > 0) {
      const validDestinationIds = portPairs
        .filter((pair) => pair.originId === originPortId)
        .map((pair) => pair.destinationId);

      if (validDestinationIds.length > 0) {
        console.log('Using port pairs to filter destinations:', {
          originPortId,
          validDestinationCount: validDestinationIds.length,
        });
        setDestinationPorts(validDestinationIds);

        // Update displayed ports
        const filtered = allPorts.filter((port) =>
          validDestinationIds.includes(port.id)
        );
        setPortOptions(filtered);
        return;
      }
    }

    // Fall back to API if port pairs didn't work
    const ports = await getDestinationPorts(originPortId, shippingLineId);

    if (ports && ports.length > 0) {
      const destinationIds = ports.map((port) => port.id);
      console.log('API returned valid destinations:', {
        originPortId,
        destinationCount: destinationIds.length,
      });
      setDestinationPorts(destinationIds);

      // Update displayed ports
      if (destinationIds.length > 0) {
        const filtered = allPorts.filter((port) =>
          destinationIds.includes(port.id)
        );
        setPortOptions(filtered);
      }
    } else {
      console.log('No valid destinations found, showing all ports');
      setPortOptions(allPorts);
    }
  };

  const onSearchPort = (value: string) => {
    let filteredPorts: IPort[];
    if (!value) {
      filteredPorts = allPorts;

      // Apply destination filtering if this is a destination field and we have an origin
      if (isDestination && originPortId && destinationPorts.length > 0) {
        filteredPorts = filteredPorts.filter((port) =>
          destinationPorts.includes(port.id)
        );
      }
    } else {
      filteredPorts = allPorts.filter(
        (port) => port.name.toLowerCase().indexOf(value.toLowerCase()) >= 0
      );

      // Apply destination filtering if this is a destination field and we have an origin
      if (isDestination && originPortId && destinationPorts.length > 0) {
        filteredPorts = filteredPorts.filter((port) =>
          destinationPorts.includes(port.id)
        );
      }
    }
    setPortOptions(filteredPorts);
  };

  return (
    <Form.Item {...formItemProps}>
      <Select
        placeholder='Select Port'
        filterOption={false}
        notFoundContent={null}
        showSearch
        onSearch={onSearchPort}
        onDropdownVisibleChange={() => onSearchPort('')}
        variant='borderless'
        size={size ?? 'large'}
        suffixIcon={null}
        allowClear={true}
        disabled={isDestination && !originPortId} // Disable destination selection until origin is selected
      >
        {portOptions
          .filter((port) => !(excludePortId && port.id === +excludePortId))
          .map((port) => (
            <Option key={port.id} value={port.id}>
              {port.name}
            </Option>
          ))}
      </Select>
    </Form.Item>
  );
}
