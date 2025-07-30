# Invoice ISP - Fiber Optic Network Management System

<p align="center">
<img src="https://raw.githubusercontent.com/invoiceninja/invoiceninja/master/public/images/round_logo.png" alt="Invoice ISP Logo" width="200"/>
</p>

<p align="center">
<strong>Complete ISP Business Management Platform with FTTH Infrastructure & WhatsApp Integration</strong>
</p>

---

## 🚀 What is Invoice ISP?

**Invoice ISP** is a comprehensive business management platform specifically designed for Internet Service Providers (ISPs) that combines traditional invoicing capabilities with advanced fiber optic network management and customer communication tools.

Built on top of Invoice Ninja's robust foundation, this application extends the core functionality with specialized modules for FTTH (Fiber to the Home) infrastructure management, network visualization, and WhatsApp integration for customer communication.

---

## 🎯 Key Features

### 📊 **Core Business Management**
- **Invoice Management**: Create, send, and track invoices with automated billing
- **Client Management**: Comprehensive customer database with service history
- **Payment Processing**: Multiple payment gateway integrations
- **Financial Reports**: Cash flow analysis, revenue tracking, and financial insights
- **Product/Service Catalog**: Manage internet packages and additional services

### 🌐 **FTTH Infrastructure Management**
- **Network Topology**: Complete fiber optic network mapping and management
- **Component Tracking**: Manage ODC, ODP, cables, tubes, cores, and client connections
- **Geolocation Support**: GPS coordinates and address geocoding for all network components
- **Capacity Planning**: Real-time utilization monitoring and capacity analysis
- **Maintenance Scheduling**: Track joint boxes and maintenance activities

### 🗺️ **Network Visualization & Mapping**
- **Interactive Maps**: Visual representation of network infrastructure using Leaflet.js
- **Component Markers**: Color-coded markers for ODC, ODP, and client locations
- **Connection Lines**: Visual representation of fiber connections with distance calculations
- **Filtering & Search**: Filter by province, city, or component type
- **Export Capabilities**: Export network data to CSV/PDF formats

### 📱 **WhatsApp Gateway Integration**
- **Multi-Device Support**: Manage multiple WhatsApp devices
- **Message Templates**: Pre-defined templates with variable placeholders
- **Bulk Messaging**: Send messages to multiple clients simultaneously
- **Automated Notifications**: Invoice reminders, payment confirmations, and service updates
- **Chatbot Support**: Automated responses and FAQ handling
- **Message History**: Complete conversation tracking and analytics

### 📈 **Advanced Reporting & Analytics**
- **FTTH Reports**: 4 comprehensive report tabs (Overview, Utilization, Status, Details)
- **Network Statistics**: Real-time infrastructure utilization metrics
- **Customer Analytics**: Service usage patterns and customer behavior insights
- **Financial Analytics**: Revenue analysis and business performance metrics
- **Export & Integration**: Data export capabilities for external analysis

---

## 🏗️ System Architecture

### **Backend (Laravel 10)**
- RESTful API architecture
- MySQL database with optimized relationships
- Real-time data processing and calculations
- Secure authentication and authorization
- Webhook support for external integrations

### **Frontend (React + TypeScript)**
- Modern, responsive user interface
- Interactive data visualization with charts
- Real-time updates and notifications
- Mobile-friendly design
- Progressive Web App capabilities

### **Database Schema**
```
FTTH Infrastructure Hierarchy:
Lokasi (Location) → ODC (Optical Distribution Cabinet) → 
Kabel ODC (Cable) → Tube Kabel (Tube) → Core Kabel (Core) → 
ODP (Optical Distribution Point) → Client FTTH (Customer)
```

---

## 🚀 Quick Start

### Prerequisites
- PHP 8.1+
- MySQL 8.0+
- Node.js 16+
- Composer
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/invoice-isp.git
cd invoice-isp
```

2. **Install PHP dependencies**
```bash
composer install --optimize-autoloader --no-dev
```

3. **Install Node.js dependencies**
```bash
cd client
npm install
npm run build
cd ..
```

4. **Environment setup**
```bash
cp .env.example .env
php artisan key:generate
```

5. **Database setup**
```bash
php artisan migrate
php artisan db:seed
```

6. **Start the application**
```bash
php artisan serve
```

### Default Login Credentials
- **Admin**: `admin@example.com` / `password`
- **Client Portal**: `client@example.com` / `password`

---

## 📋 System Requirements

### **Minimum Requirements**
- **Server**: 2GB RAM, 20GB Storage
- **PHP**: 8.1+ with extensions (BCMath, Ctype, JSON, Mbstring, OpenSSL, PDO, Tokenizer, XML)
- **Database**: MySQL 8.0+ or MariaDB 10.3+
- **Web Server**: Apache 2.4+ or Nginx 1.18+

### **Recommended Requirements**
- **Server**: 4GB RAM, 50GB SSD Storage
- **PHP**: 8.2+ with OPcache enabled
- **Database**: MySQL 8.0+ with InnoDB engine
- **Web Server**: Nginx with PHP-FPM
- **SSL Certificate**: For production deployment

---

## 🔧 Configuration

### **Environment Variables**
```env
# Database Configuration
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=invoice_isp
DB_USERNAME=your_username
DB_PASSWORD=your_password

# WhatsApp Gateway Configuration
WA_SERVICE_URL=http://localhost:3000
WA_SERVICE_TOKEN=your_wa_token

# Google Maps API (for geocoding)
GOOGLE_MAPS_API_KEY=your_google_maps_key

# Payment Gateway Configuration
STRIPE_KEY=your_stripe_key
STRIPE_SECRET=your_stripe_secret
```

### **WhatsApp Gateway Setup**
1. Configure WhatsApp service URL in `.env`
2. Set up WhatsApp devices in the admin panel
3. Scan QR codes to connect devices
4. Configure message templates and chatbots

---

## 📊 FTTH Infrastructure Management

### **Network Components**

#### **Lokasi (Location)**
- Geographic locations with GPS coordinates
- Address information with geocoding
- Status tracking (active/archived)

#### **ODC (Optical Distribution Cabinet)**
- Central distribution points
- Capacity management and utilization tracking
- Connection to multiple ODPs

#### **Kabel ODC (Cable)**
- Fiber optic cable specifications
- Length, type, and capacity information
- Tube and core organization

#### **Tube Kabel (Tube)**
- Color-coded tube identification
- Core organization within tubes
- Capacity and utilization tracking

#### **Core Kabel (Core)**
- Individual fiber core management
- Connection status to ODPs
- Color coding and identification

#### **ODP (Optical Distribution Point)**
- Local distribution points
- Splitter configuration and capacity
- Client connection management

#### **Client FTTH (Customer)**
- Customer information and service details
- Package and billing integration
- Connection status and history

---

## 🗺️ Mapping & Visualization

### **Interactive Network Map**
- **Real-time Visualization**: Live network topology display
- **Component Markers**: Color-coded markers for different components
- **Connection Lines**: Visual representation of fiber connections
- **Distance Calculations**: Automatic distance calculation between components
- **Filtering Options**: Filter by location, component type, or status

### **Geolocation Features**
- **GPS Integration**: Coordinate-based component positioning
- **Address Geocoding**: Automatic coordinate generation from addresses
- **Map Center Management**: Configurable map center points
- **Export Capabilities**: Export map data and statistics

---

## 📱 WhatsApp Gateway Features

### **Device Management**
- **Multi-Device Support**: Manage multiple WhatsApp devices
- **Connection Status**: Real-time device connection monitoring
- **QR Code Authentication**: Secure device connection via QR codes
- **Default Device**: Set primary device for automated messages

### **Message Management**
- **Template System**: Pre-defined message templates with variables
- **Bulk Messaging**: Send messages to multiple clients
- **File Attachments**: Support for images, documents, and PDFs
- **Message History**: Complete conversation tracking
- **Delivery Status**: Real-time message delivery tracking

### **Automation Features**
- **Invoice Notifications**: Automatic invoice delivery via WhatsApp
- **Payment Reminders**: Scheduled payment reminder messages
- **Service Updates**: Automated service status notifications
- **Chatbot Integration**: Automated FAQ and support responses

---

## 📈 Reporting & Analytics

### **FTTH Reports Dashboard**

#### **Overview Tab**
- Summary cards for all network components
- Bar charts showing distribution patterns
- Network coverage statistics
- Export capabilities for data analysis

#### **Utilization Tab**
- Real-time capacity utilization metrics
- Pie charts for core, tube, and ODP utilization
- Bottleneck identification tools
- Capacity planning insights

#### **Status Tab**
- Component status distribution
- Active vs. archived component tracking
- Maintenance scheduling overview
- Status trend analysis

#### **Details Tab**
- Hierarchical network view
- Drill-down capabilities for detailed analysis
- Component relationship mapping
- Comprehensive data export options

---

## 🔒 Security Features

### **Authentication & Authorization**
- Role-based access control (RBAC)
- Multi-factor authentication support
- Session management and security
- API token authentication

### **Data Protection**
- Encrypted data storage
- Secure API communications
- GDPR compliance features
- Regular security updates

---

## 🚀 Deployment Options

### **Self-Hosted Deployment**
- Full control over data and infrastructure
- Customizable branding and features
- No recurring subscription fees
- Complete data ownership

### **Cloud Deployment**
- Scalable cloud infrastructure
- Automated backups and monitoring
- High availability and performance
- Managed security updates

### **Docker Deployment**
```bash
# Using Docker Compose
docker-compose up -d

# Using Docker Hub image
docker pull invoice-isp/latest
docker run -d -p 8000:8000 invoice-isp
```

---

## 🤝 Contributing

We welcome contributions to improve Invoice ISP! Please read our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Development Setup**
```bash
# Install development dependencies
composer install
npm install

# Run development server
php artisan serve
npm run dev

# Run tests
php artisan test
npm run test
```

---

## 📚 Documentation

- **[User Manual](BUKU_MANUAL_SISTEM_INVOICE_ISP.md)**: Comprehensive user guide in Indonesian
- **[API Documentation](openapi/api-docs.yaml)**: Complete API reference
- **[Developer Guide](docs/developer-guide.md)**: Technical documentation for developers
- **[Installation Guide](docs/installation.md)**: Detailed installation instructions

---

## 🆘 Support

### **Community Support**
- **GitHub Issues**: Report bugs and request features
- **Discussions**: Community discussions and Q&A
- **Wiki**: Community-maintained documentation

### **Professional Support**
- **Email Support**: support@invoice-isp.com
- **WhatsApp Support**: +62-xxx-xxxx-xxxx
- **Phone Support**: +62-xxx-xxxx-xxxx

---

## 📄 License

This project is licensed under the Elastic License 2.0 - see the [LICENSE](LICENSE) file for details.

### **Commercial Licensing**
- **White-label License**: $30/year to remove branding
- **Enterprise Support**: Custom pricing for enterprise deployments
- **Custom Development**: Tailored solutions for specific requirements

---

## 🙏 Acknowledgments

- **Invoice Ninja Team**: For the robust foundation and core functionality
- **Laravel Community**: For the excellent PHP framework
- **React Community**: For the powerful frontend framework
- **Open Source Contributors**: For various libraries and tools used

---

## 📞 Contact

- **Website**: https://invoice-isp.com
- **Email**: info@invoice-isp.com
- **WhatsApp**: +62-xxx-xxxx-xxxx
- **Address**: Your Company Address

---

<p align="center">
Made with ❤️ for Internet Service Providers
</p>
