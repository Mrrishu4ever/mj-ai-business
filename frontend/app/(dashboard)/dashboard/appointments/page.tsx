'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Plus, Clock, Check, X, Loader2, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { appointmentsApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function AppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const { data } = await appointmentsApi.getAll({ date: selectedDate });
      setAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await appointmentsApi.update(id, { status });
      setAppointments(appointments.map((a) => (a.id === id ? { ...a, status } : a)));
    } catch (err) {
      console.error(err);
    }
  };

  // Generate calendar days
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const currentMonth = new Date(selectedDate + '-01');
  const calendarDays = getDaysInMonth(currentMonth);

  const goToPrevMonth = () => {
    const prev = new Date(currentMonth);
    prev.setMonth(prev.getMonth() - 1);
    setSelectedDate(prev.toISOString().split('T')[0]);
  };

  const goToNextMonth = () => {
    const next = new Date(currentMonth);
    next.setMonth(next.getMonth() + 1);
    setSelectedDate(next.toISOString().split('T')[0]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Appointments</h1>
          <p className="text-muted-foreground">Manage your bookings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5" />
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </CardTitle>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={goToPrevMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={goToNextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-xs font-medium text-muted-foreground p-2">
                  {day}
                </div>
              ))}
              {calendarDays.map((day, i) => (
                <button
                  key={i}
                  disabled={!day}
                  onClick={() => day && setSelectedDate(day.toISOString().split('T')[0])}
                  className={`p-2 text-sm rounded-lg ${
                    day?.toISOString().split('T')[0] === selectedDate
                      ? 'bg-primary text-primary-foreground'
                      : day
                      ? 'hover:bg-secondary'
                      : ''
                  }`}
                >
                  {day?.getDate()}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </CardTitle>
            <CardDescription>
              {appointments.length} appointment(s)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {appointments.length > 0 ? (
              <div className="divide-y divide-border">
                {appointments.map((apt: any) => (
                  <div key={apt.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <CalendarIcon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{apt.title}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {' '}({apt.duration} min)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {apt.status === 'PENDING' && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleStatusChange(apt.id, 'CONFIRMED')}>
                            <Check className="w-3 h-3 mr-1" /> Confirm
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleStatusChange(apt.id, 'CANCELLED')}>
                            <X className="w-3 h-3 mr-1" /> Cancel
                          </Button>
                        </>
                      )}
                      <Badge
                        variant={
                          apt.status === 'CONFIRMED' ? 'success' :
                          apt.status === 'CANCELLED' ? 'destructive' :
                          apt.status === 'COMPLETED' ? 'outline' : 'secondary'
                        }
                      >
                        {apt.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CalendarIcon className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No appointments for this date</p>
                <Button variant="outline" className="mt-3">
                  <Plus className="w-4 h-4 mr-2" /> Add Appointment
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}