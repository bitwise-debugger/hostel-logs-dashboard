import { useState, useMemo } from 'react';
import { Search, MapPin, Phone, User, Home, Filter } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Select, SelectItem } from '../components/ui/select';

const Students = ({ allotments, isMobile }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHostel, setSelectedHostel] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');

  const allotmentsList = useMemo(() => {
    return Object.values(allotments);
  }, [allotments]);

  // Get unique hostels
  const hostels = useMemo(() => {
    const uniqueHostels = [...new Set(allotmentsList.map(s => s.Hostel).filter(Boolean))];
    return uniqueHostels.sort();
  }, [allotmentsList]);

  // Get rooms for selected hostel
  const rooms = useMemo(() => {
    if (!selectedHostel) return [];
    const hostelRooms = allotmentsList
      .filter(s => s.Hostel === selectedHostel)
      .map(s => s.Room)
      .filter(Boolean);
    return [...new Set(hostelRooms)].sort();
  }, [allotmentsList, selectedHostel]);

  const filteredStudents = useMemo(() => {
    let filtered = allotmentsList;

    // Filter by hostel
    if (selectedHostel) {
      filtered = filtered.filter(s => s.Hostel === selectedHostel);
    }

    // Filter by room
    if (selectedRoom) {
      filtered = filtered.filter(s => s.Room === selectedRoom);
    }

    // Filter by search term (name or roll number)
    if (searchTerm) {
      filtered = filtered.filter(student => {
        const name = student.Name?.toLowerCase() || '';
        const rollNo = student['Roll No.']?.toLowerCase() || '';
        return (
          name.includes(searchTerm.toLowerCase()) ||
          rollNo.includes(searchTerm.toLowerCase())
        );
      });
    }

    return filtered;
  }, [allotmentsList, searchTerm, selectedHostel, selectedRoom]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedHostel('');
    setSelectedRoom('');
  };

  return (
    <div className="p-3 flex-1 flex flex-col overflow-hidden">
      <div className="p-3 md:p-6 space-y-4 md:space-y-6 overflow-auto">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Student Allotments</h1>
        <p className="text-sm text-slate-500 mt-1">View and manage student hostel allotments</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Hostel Select */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Hostel
              </label>
              <Select
                value={selectedHostel}
                onValueChange={(value) => {
                  setSelectedHostel(value);
                  setSelectedRoom(''); // Reset room when hostel changes
                }}
                placeholder="All Hostels"
              >
                {hostels.map(hostel => (
                  <SelectItem key={hostel} value={hostel}>
                    {hostel}
                  </SelectItem>
                ))}
              </Select>
            </div>

            {/* Room Select */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Room
              </label>
              <Select
                value={selectedRoom}
                onValueChange={setSelectedRoom}
                placeholder="All Rooms"
                disabled={!selectedHostel}
              >
                {rooms.map(room => (
                  <SelectItem key={room} value={room}>
                    {room}
                  </SelectItem>
                ))}
              </Select>
            </div>

            {/* Search by Name/Roll No */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <Input
                  type="text"
                  placeholder="Name or Roll No..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Actions
              </label>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleClearFilters}
                  className="flex-1"
                >
                  Clear
                </Button>
                <Button variant="outline" className="flex-1">
                  {filteredStudents.length} Found
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Grid */}
      <div className="flex-1 mt-3 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-950 flex items-center justify-center text-cyan-600 dark:text-cyan-400 flex-shrink-0">
                    <User size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                      {student.Name}
                    </h3>
                    <p className="text-sm text-slate-500 truncate">{student['Roll No.']}</p>
                    
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Home size={14} className="text-cyan-600 flex-shrink-0" />
                        <span className="text-slate-600 dark:text-slate-400 truncate">
                          {student.Hostel} - Room {student.Room}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Phone size={14} className="text-cyan-600 flex-shrink-0" />
                        <span className="text-slate-600 dark:text-slate-400 truncate">
                          {student.Contact || 'N/A'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap mt-2">
                        <Badge variant={student['Mess Status'] === 'ON' ? 'success' : 'secondary'}>
                          Mess: {student['Mess Status']}
                        </Badge>
                        <Badge variant="outline">
                          Batch: {student.Batch}
                        </Badge>
                        {student.Arrears && student.Arrears !== '-' && (
                          <Badge variant="destructive">
                            Arrears: {student.Arrears}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <User className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <p className="text-lg font-medium text-slate-600 dark:text-slate-400">
                No Students Found
              </p>
              <p className="text-sm text-slate-500">
                Try adjusting your filters
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Students;
