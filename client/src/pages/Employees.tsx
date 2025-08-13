import { useState } from 'react';
import { toast } from 'react-toastify';
import {
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  IdentificationIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  hireDate: string;
  department: 'Front Desk' | 'Housekeeping' | 'Maintenance' | 'Kitchen' | 'Security' | 'Management';
  position: string;
  employeeId: string;
  salary: number;
  status: 'Active' | 'Inactive' | 'On Leave' | 'Terminated';
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  notes: string;
  createdAt: string;
}

interface Task {
  id: string;
  employeeId: string;
  title: string;
  description: string;
  department: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  assignedDate: string;
  dueDate: string;
  completedDate?: string;
}

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.johnson@hotel.com',
      phone: '+1 (555) 123-4567',
      address: '123 Main St, City, State 12345',
      dateOfBirth: '1990-05-15',
      hireDate: '2023-01-15',
      department: 'Front Desk',
      position: 'Front Desk Manager',
      employeeId: 'EMP001',
      salary: 45000,
      status: 'Active',
      emergencyContact: {
        name: 'John Johnson',
        phone: '+1 (555) 987-6543',
        relationship: 'Spouse'
      },
      notes: 'Excellent customer service skills. Speaks English and Spanish.',
      createdAt: '2023-01-15',
    },
    {
      id: '2',
      firstName: 'Bob',
      lastName: 'Wilson',
      email: 'bob.wilson@hotel.com',
      phone: '+1 (555) 234-5678',
      address: '456 Oak Ave, City, State 12345',
      dateOfBirth: '1985-08-22',
      hireDate: '2022-06-10',
      department: 'Housekeeping',
      position: 'Housekeeping Supervisor',
      employeeId: 'EMP002',
      salary: 38000,
      status: 'Active',
      emergencyContact: {
        name: 'Mary Wilson',
        phone: '+1 (555) 876-5432',
        relationship: 'Sister'
      },
      notes: 'Very reliable and detail-oriented. 5+ years of experience.',
      createdAt: '2022-06-10',
    },
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      employeeId: '1',
      title: 'Update guest check-in procedures',
      description: 'Review and update the standard operating procedures for guest check-in process',
      department: 'Front Desk',
      priority: 'Medium',
      status: 'In Progress',
      assignedDate: '2025-01-25',
      dueDate: '2025-02-01',
    },
    {
      id: '2',
      employeeId: '2',
      title: 'Deep clean Presidential Suite',
      description: 'Perform thorough deep cleaning of Presidential Suite before VIP guest arrival',
      department: 'Housekeeping',
      priority: 'High',
      status: 'Pending',
      assignedDate: '2025-01-28',
      dueDate: '2025-01-30',
    },
  ]);

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [employeeForm, setEmployeeForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    department: 'Front Desk' as Employee['department'],
    position: '',
    salary: 0,
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    notes: '',
  });

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'Medium' as Task['priority'],
    dueDate: '',
  });

  const departments = ['Front Desk', 'Housekeeping', 'Maintenance', 'Kitchen', 'Security', 'Management'];

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch = 
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment = 
      filterDepartment === 'all' || 
      employee.department === filterDepartment;

    const matchesStatus = 
      filterStatus === 'all' || 
      employee.status === filterStatus;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getEmployeeTasks = (employeeId: string) => {
    return tasks.filter(task => task.employeeId === employeeId);
  };

  const handleSubmitEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingEmployee) {
      // Update existing employee
      const updatedEmployee: Employee = {
        ...editingEmployee,
        firstName: employeeForm.firstName,
        lastName: employeeForm.lastName,
        email: employeeForm.email,
        phone: employeeForm.phone,
        address: employeeForm.address,
        dateOfBirth: employeeForm.dateOfBirth,
        department: employeeForm.department,
        position: employeeForm.position,
        salary: employeeForm.salary,
        emergencyContact: {
          name: employeeForm.emergencyContactName,
          phone: employeeForm.emergencyContactPhone,
          relationship: employeeForm.emergencyContactRelationship,
        },
        notes: employeeForm.notes,
      };

      setEmployees(prev => prev.map(emp => emp.id === editingEmployee.id ? updatedEmployee : emp));
      toast.success('Employee updated successfully!');
    } else {
      // Create new employee
      const newEmployee: Employee = {
        id: Date.now().toString(),
        firstName: employeeForm.firstName,
        lastName: employeeForm.lastName,
        email: employeeForm.email,
        phone: employeeForm.phone,
        address: employeeForm.address,
        dateOfBirth: employeeForm.dateOfBirth,
        hireDate: new Date().toISOString().split('T')[0],
        department: employeeForm.department,
        position: employeeForm.position,
        employeeId: `EMP${String(employees.length + 1).padStart(3, '0')}`,
        salary: employeeForm.salary,
        status: 'Active',
        emergencyContact: {
          name: employeeForm.emergencyContactName,
          phone: employeeForm.emergencyContactPhone,
          relationship: employeeForm.emergencyContactRelationship,
        },
        notes: employeeForm.notes,
        createdAt: new Date().toISOString().split('T')[0],
      };

      setEmployees(prev => [...prev, newEmployee]);
      toast.success('Employee added successfully!');
    }

    setShowEmployeeForm(false);
    setEditingEmployee(null);
    resetEmployeeForm();
  };

  const handleSubmitTask = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEmployee) return;

    const newTask: Task = {
      id: Date.now().toString(),
      employeeId: selectedEmployee.id,
      title: taskForm.title,
      description: taskForm.description,
      department: selectedEmployee.department,
      priority: taskForm.priority,
      status: 'Pending',
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: taskForm.dueDate,
    };

    setTasks(prev => [...prev, newTask]);
    setShowTaskForm(false);
    setTaskForm({
      title: '',
      description: '',
      priority: 'Medium',
      dueDate: '',
    });
    
    toast.success('Task assigned successfully!');
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setEmployeeForm({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone,
      address: employee.address,
      dateOfBirth: employee.dateOfBirth,
      department: employee.department,
      position: employee.position,
      salary: employee.salary,
      emergencyContactName: employee.emergencyContact.name,
      emergencyContactPhone: employee.emergencyContact.phone,
      emergencyContactRelationship: employee.emergencyContact.relationship,
      notes: employee.notes,
    });
    setShowEmployeeForm(true);
  };

  const handleDeleteEmployee = (employeeId: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
      setTasks(prev => prev.filter(task => task.employeeId !== employeeId));
      if (selectedEmployee?.id === employeeId) {
        setSelectedEmployee(null);
      }
      toast.success('Employee deleted successfully!');
    }
  };

  const resetEmployeeForm = () => {
    setEmployeeForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      dateOfBirth: '',
      department: 'Front Desk',
      position: '',
      salary: 0,
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelationship: '',
      notes: '',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-orange-700 bg-gradient-to-r from-orange-100 to-red-100 border-orange-300';
      case 'Inactive': return 'text-gray-700 bg-gradient-to-r from-gray-100 to-slate-100 border-gray-300';
      case 'On Leave': return 'text-amber-700 bg-gradient-to-r from-amber-100 to-yellow-100 border-amber-300';
      case 'Terminated': return 'text-red-700 bg-gradient-to-r from-red-100 to-pink-100 border-red-300';
      default: return 'text-gray-700 bg-gradient-to-r from-gray-100 to-slate-100 border-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'text-red-700 bg-gradient-to-r from-red-100 to-pink-100 border-red-300';
      case 'High': return 'text-orange-700 bg-gradient-to-r from-orange-100 to-amber-100 border-orange-300';
      case 'Medium': return 'text-amber-700 bg-gradient-to-r from-amber-100 to-yellow-100 border-amber-300';
      case 'Low': return 'text-amber-700 bg-gradient-to-r from-amber-100 to-yellow-100 border-amber-300';
      default: return 'text-gray-700 bg-gradient-to-r from-gray-100 to-slate-100 border-gray-300';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-orange-700 bg-gradient-to-r from-orange-100 to-red-100 border-orange-300';
      case 'In Progress': return 'text-amber-700 bg-gradient-to-r from-amber-100 to-orange-100 border-amber-300';
      case 'Pending': return 'text-amber-700 bg-gradient-to-r from-amber-100 to-yellow-100 border-amber-300';
      case 'Cancelled': return 'text-red-700 bg-gradient-to-r from-red-100 to-pink-100 border-red-300';
      default: return 'text-gray-700 bg-gradient-to-r from-gray-100 to-slate-100 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-primary/2 to-secondary/2">
      {/* Modern Header */}
      <div className="relative bg-gradient-to-r from-primary/8 via-secondary/6 to-accent/4 backdrop-blur-sm border-b border-primary/10">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/2 to-secondary/2 opacity-30"></div>
        <div className="relative container mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 lg:gap-6">
            <div className="flex items-center space-x-4 lg:space-x-6">
              <div className="p-3 lg:p-4 bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm rounded-xl border border-primary/20 shadow-lg">
                <IdentificationIcon className="h-8 w-8 lg:h-10 lg:w-10 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Employee Management
                </h1>
                <p className="text-base-content/60 mt-1 sm:mt-2 text-sm sm:text-base lg:text-lg">Manage your hotel staff and workforce</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingEmployee(null);
                resetEmployeeForm();
                setShowEmployeeForm(true);
              }}
              className="bg-gradient-to-r from-primary to-secondary text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 group flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform duration-200" />
              <span className="hidden sm:inline">Add Employee</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">

      {/* Search and Filter */}
      <div className="bg-base-100/80 backdrop-blur-md rounded-xl shadow-lg border border-primary/10 p-4 sm:p-6 mb-6 lg:mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-6 space-y-4 lg:space-y-0">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40" />
            <input
              type="text"
              placeholder="Search employees by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-base-200/50 border border-primary/20 rounded-lg text-base-content placeholder-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all duration-200 text-sm sm:text-base"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2 text-base-content/60">
              <FunnelIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm font-medium">Filter:</span>
            </div>
            
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-3 py-2 bg-base-200/50 border border-primary/20 rounded-lg text-base-content focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all duration-200 text-sm"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-base-200/50 border border-primary/20 rounded-lg text-base-content focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all duration-200 text-sm"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="On Leave">On Leave</option>
              <option value="Terminated">Terminated</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Employees List */}
        <div className="lg:col-span-2">
          <div className="bg-base-200 rounded-lg shadow-lg">
            <div className="p-4 border-b border-base-300">
              <h2 className="text-lg font-semibold text-base-content">
                Employees ({filteredEmployees.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-600 max-h-96 overflow-y-auto">
              {filteredEmployees.map((employee) => (
                <div
                  key={employee.id}
                  onClick={() => setSelectedEmployee(employee)}
                  className={`p-4 cursor-pointer transition-colors hover:bg-primary ${
                    selectedEmployee?.id === employee.id ? 'bg-primary' : ''
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center border border-primary/20">
                        <UserIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-base-content font-semibold text-sm sm:text-base">
                          {employee.firstName} {employee.lastName}
                        </h3>
                        <p className="text-base-content/60 text-xs sm:text-sm">{employee.position}</p>
                        <p className="text-base-content/40 text-xs">{employee.employeeId}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                          {employee.status}
                        </span>
                        <span className="text-base-content/60 text-xs sm:text-sm bg-base-200/50 px-2 py-1 rounded-md">{employee.department}</span>
                      </div>
                      <div className="flex space-x-1 self-end sm:self-auto">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditEmployee(employee);
                          }}
                          className="p-2 text-base-content/60 hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 border border-transparent hover:border-primary/20"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEmployee(employee.id);
                          }}
                          className="p-2 text-base-content/60 hover:text-error hover:bg-error/5 rounded-lg transition-all duration-200 border border-transparent hover:border-error/20"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredEmployees.length === 0 && (
                <div className="p-6 sm:p-8 text-center">
                  <UserIcon className="h-10 w-10 sm:h-12 sm:w-12 text-base-content/40 mx-auto mb-4" />
                  <p className="text-base-content/60 text-sm sm:text-base">No employees found</p>
                  <p className="text-base-content/40 text-xs sm:text-sm mt-1">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Employee Details */}
        <div className="lg:col-span-1">
          {selectedEmployee ? (
            <div className="bg-base-200 rounded-lg shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-12 w-12 bg-secondary rounded-full flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-base-content" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-base-content">
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </h3>
                  <p className="text-base-content/60">{selectedEmployee.position}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedEmployee.status)}`}>
                    {selectedEmployee.status}
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3 text-gray-300">
                  <IdentificationIcon className="h-5 w-5" />
                  <span className="text-sm">ID: {selectedEmployee.employeeId}</span>
                </div>
                
                <div className="flex items-center space-x-3 text-gray-300">
                  <EnvelopeIcon className="h-5 w-5" />
                  <span className="text-sm">{selectedEmployee.email}</span>
                </div>
                
                <div className="flex items-center space-x-3 text-gray-300">
                  <PhoneIcon className="h-5 w-5" />
                  <span className="text-sm">{selectedEmployee.phone}</span>
                </div>
                
                <div className="flex items-center space-x-3 text-gray-300">
                  <BuildingOfficeIcon className="h-5 w-5" />
                  <span className="text-sm">{selectedEmployee.department}</span>
                </div>
                
                <div className="flex items-center space-x-3 text-gray-300">
                  <CalendarDaysIcon className="h-5 w-5" />
                  <span className="text-sm">Hired: {selectedEmployee.hireDate}</span>
                </div>
                
                <div className="flex items-center space-x-3 text-gray-300">
                  <CurrencyDollarIcon className="h-5 w-5" />
                  <span className="text-sm">Salary: ${selectedEmployee.salary.toLocaleString()}</span>
                </div>
              </div>

              {selectedEmployee.notes && (
                <div className="mb-6">
                  <h4 className="text-base-content font-medium mb-2">Notes</h4>
                  <p className="text-gray-300 text-sm">{selectedEmployee.notes}</p>
                </div>
              )}

              <div className="mb-6">
                <h4 className="text-base-content font-medium mb-2">Emergency Contact</h4>
                <div className="text-gray-300 text-sm">
                  <p>{selectedEmployee.emergencyContact.name}</p>
                  <p>{selectedEmployee.emergencyContact.phone}</p>
                  <p className="text-base-content/60">{selectedEmployee.emergencyContact.relationship}</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-base-content font-medium">Tasks ({getEmployeeTasks(selectedEmployee.id).length})</h4>
                  <button
                    onClick={() => setShowTaskForm(true)}
                    className="px-3 py-1 bg-secondary hover:bg-secondary/90 text-base-content rounded text-sm transition-colors"
                  >
                    Assign Task
                  </button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {getEmployeeTasks(selectedEmployee.id).map((task) => (
                    <div key={task.id} className="p-3 bg-primary rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="text-base-content font-medium text-sm">{task.title}</h5>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-base-content/60 text-xs mb-2">{task.description}</p>
                      <div className="flex justify-between items-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTaskStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                        <span className="text-base-content/60 text-xs">Due: {task.dueDate}</span>
                      </div>
                    </div>
                  ))}
                  
                  {getEmployeeTasks(selectedEmployee.id).length === 0 && (
                    <p className="text-base-content/60 text-sm text-center py-4">No tasks assigned</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <button className="w-full px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2">
                  <DocumentTextIcon className="h-4 w-4" />
                  <span>Generate Report</span>
                </button>
                <button className="w-full px-4 py-2 border-2 border-amber-300 text-amber-700 hover:bg-amber-50 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  View Performance
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-base-200 rounded-lg shadow-lg p-6 text-center">
              <UserIcon className="h-12 w-12 text-base-content/60 mx-auto mb-4" />
              <p className="text-base-content/60">Select an employee to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Employee Modal */}
      {showEmployeeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-200 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-base-content">
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
              </h2>
              <button
                onClick={() => {
                  setShowEmployeeForm(false);
                  setEditingEmployee(null);
                  resetEmployeeForm();
                }}
                className="text-base-content/60 hover:text-base-content transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitEmployee} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={employeeForm.firstName}
                    onChange={(e) => setEmployeeForm(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 bg-base-100 border-base-300 rounded-md text-base-content focus:ring-2 focus:ring-secondary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={employeeForm.lastName}
                    onChange={(e) => setEmployeeForm(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 bg-base-100 border-base-300 rounded-md text-base-content focus:ring-2 focus:ring-secondary focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={employeeForm.email}
                    onChange={(e) => setEmployeeForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-base-100 border-base-300 rounded-md text-base-content focus:ring-2 focus:ring-secondary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={employeeForm.phone}
                    onChange={(e) => setEmployeeForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 bg-base-100 border-base-300 rounded-md text-base-content focus:ring-2 focus:ring-secondary focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Address
                </label>
                <textarea
                  value={employeeForm.address}
                  onChange={(e) => setEmployeeForm(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 bg-base-100 border-base-300 rounded-md text-base-content focus:ring-2 focus:ring-secondary focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={employeeForm.dateOfBirth}
                    onChange={(e) => setEmployeeForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    className="w-full px-3 py-2 bg-base-100 border-base-300 rounded-md text-base-content focus:ring-2 focus:ring-secondary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Department *
                  </label>
                  <select
                    required
                    value={employeeForm.department}
                    onChange={(e) => setEmployeeForm(prev => ({ ...prev, department: e.target.value as Employee['department'] }))}
                    className="w-full px-3 py-2 bg-base-100 border-base-300 rounded-md text-base-content focus:ring-2 focus:ring-secondary focus:border-transparent"
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Position *
                  </label>
                  <input
                    type="text"
                    required
                    value={employeeForm.position}
                    onChange={(e) => setEmployeeForm(prev => ({ ...prev, position: e.target.value }))}
                    className="w-full px-3 py-2 bg-base-100 border-base-300 rounded-md text-base-content focus:ring-2 focus:ring-secondary focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Annual Salary *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-base-content/60">$</span>
                  <input
                    type="number"
                    required
                    min="0"
                    value={employeeForm.salary}
                    onChange={(e) => setEmployeeForm(prev => ({ ...prev, salary: parseInt(e.target.value) || 0 }))}
                    className="w-full pl-8 pr-3 py-2 bg-base-100 border-base-300 rounded-md text-base-content focus:ring-2 focus:ring-secondary focus:border-transparent"
                  />
                </div>
              </div>

              <div className="border-t border-base-300 pt-4">
                <h3 className="text-lg font-medium text-base-content mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={employeeForm.emergencyContactName}
                      onChange={(e) => setEmployeeForm(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                      className="w-full px-3 py-2 bg-base-100 border-base-300 rounded-md text-base-content focus:ring-2 focus:ring-secondary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={employeeForm.emergencyContactPhone}
                      onChange={(e) => setEmployeeForm(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
                      className="w-full px-3 py-2 bg-base-100 border-base-300 rounded-md text-base-content focus:ring-2 focus:ring-secondary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Relationship
                    </label>
                    <input
                      type="text"
                      value={employeeForm.emergencyContactRelationship}
                      onChange={(e) => setEmployeeForm(prev => ({ ...prev, emergencyContactRelationship: e.target.value }))}
                      className="w-full px-3 py-2 bg-base-100 border-base-300 rounded-md text-base-content focus:ring-2 focus:ring-secondary focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={employeeForm.notes}
                  onChange={(e) => setEmployeeForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 bg-base-100 border-base-300 rounded-md text-base-content focus:ring-2 focus:ring-secondary focus:border-transparent"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEmployeeForm(false);
                    setEditingEmployee(null);
                    resetEmployeeForm();
                  }}
                  className="flex-1 px-4 py-2 border border-base-300 text-gray-300 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-secondary hover:bg-secondary/90 text-base-content rounded-md transition-colors"
                >
                  {editingEmployee ? 'Update Employee' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Task Modal */}
      {showTaskForm && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-200 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-base-content">Assign Task</h2>
              <button
                onClick={() => setShowTaskForm(false)}
                className="text-base-content/60 hover:text-base-content transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-primary rounded-lg">
              <p className="text-base-content font-medium">
                {selectedEmployee.firstName} {selectedEmployee.lastName}
              </p>
              <p className="text-base-content/60 text-sm">{selectedEmployee.position}</p>
            </div>

            <form onSubmit={handleSubmitTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-base-100 border-base-300 rounded-md text-base-content focus:ring-2 focus:ring-secondary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 bg-base-100 border-base-300 rounded-md text-base-content focus:ring-2 focus:ring-secondary focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
                    className="w-full px-3 py-2 bg-base-100 border-base-300 rounded-md text-base-content focus:ring-2 focus:ring-secondary focus:border-transparent"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 bg-base-100 border-base-300 rounded-md text-base-content focus:ring-2 focus:ring-secondary focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTaskForm(false)}
                  className="flex-1 px-4 py-2 border border-base-300 text-gray-300 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-secondary hover:bg-secondary/90 text-base-content rounded-md transition-colors"
                >
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Employees;
