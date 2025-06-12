import { Booking } from './types';

declare module './components/BookingList' {
  interface BookingListProps {
    bookings: Booking[];
    onEdit: (booking: Booking) => void;
    onDelete: (id: number) => void;
  }
  export function BookingList(props: BookingListProps): JSX.Element;
}

declare module './components/BookingForm' {
  interface BookingFormProps {
    booking?: Booking;
    onSave: (bookingData: Partial<Booking>) => void;
    onCancel: () => void;
  }
  export function BookingForm(props: BookingFormProps): JSX.Element;
}

declare module './components/BookingCalendar' {
  interface BookingCalendarProps {
    bookings: Booking[];
  }
  export function BookingCalendar(props: BookingCalendarProps): JSX.Element;
}

declare module './components/ApartmentList' {
  export function ApartmentList(): JSX.Element;
} 