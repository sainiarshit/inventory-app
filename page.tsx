"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { Package, ShoppingCart, DollarSign, Plus, Edit, Trash2, Search, Scan, AlertTriangle } from "lucide-react"
import { AuthProvider, useAuth, LoginForm, UserHeader } from "@/components/auth-wrapper"
import { InvoiceModal } from "@/components/invoice-modal"
import { Pagination } from "@/components/pagination"
import { EditProductModal } from "@/components/edit-product-modal"
import { BarcodeScanner } from "@/components/barcode-scanner"
import { DateFilter } from "@/components/date-filter"
import { RecentActivity } from "@/components/recent-activity"
import { ExportOptions } from "@/components/export-options"
import { ToastProvider } from "@/components/toast-provider"
import { toast } from "sonner"
import { format, subDays, startOfDay, endOfDay, startOfYear, endOfYear } from "date-fns"

// Types
interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
  minStock: number
  supplier: string
  barcode?: string
  createdAt: Date
}

interface Sale {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalAmount: number
  customerName: string
  date: Date
}

interface Purchase {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalAmount: number
  supplier: string
  date: Date
}

interface Activity {
  id: string
  type: "sale" | "purchase" | "product_added" | "low_stock"
  message: string
  timestamp: Date
  amount?: number
}

function InventorySystem() {
  const { user } = useAuth()

  // State management
 const [products, setProducts] = useState<Product[]>([]);

 {/*useEffect(() => {
  fetch("http://localhost:5000/api/products")
    .then((res) => res.json())
    .then((data) => {
      setProducts(data);
    })
    .catch((error) => {
      console.error("Failed to fetch products:", error);
    });
}, []);
*/}
// Corrected version for inventorySystem
useEffect(() => {
  fetch("http://localhost:5800/api/products")
    .then((response) => response.json())
    .then((data) => {
      setProducts(data);
    })
    .catch((error) => {
      console.error("Failed to fetch products:", error);
    });
}, []); // Don't forget the dependency array
  const [sales, setSales] = useState<Sale[]>([
    {
      id: "s1",
      productId: "1",
      productName: "Laptop Dell XPS 13",
      quantity: 2,
      unitPrice: 999.99,
      totalAmount: 1999.98,
      customerName: "John Doe",
      date: new Date("2024-12-01"),
    },
    {
      id: "s2",
      productId: "2",
      productName: "iPhone 15 Pro",
      quantity: 1,
      unitPrice: 1199.99,
      totalAmount: 1199.99,
      customerName: "Jane Smith",
      date: new Date("2024-12-02"),
    },
    {
      id: "s3",
      productId: "4",
      productName: "Wireless Mouse",
      quantity: 5,
      unitPrice: 49.99,
      totalAmount: 249.95,
      customerName: "Bob Johnson",
      date: new Date("2024-12-03"),
    },
  ])

  const [purchases, setPurchases] = useState<Purchase[]>([
    {
      id: "p1",
      productId: "1",
      productName: "Laptop Dell XPS 13",
      quantity: 10,
      unitPrice: 800.0,
      totalAmount: 8000.0,
      supplier: "Dell Inc.",
      date: new Date("2024-11-15"),
    },
  ])

  const [activities, setActivities] = useState<Activity[]>([
    {
      id: "a1",
      type: "low_stock",
      message: "iPhone 15 Pro is running low on stock (3 remaining)",
      timestamp: new Date(),
    },
    {
      id: "a2",
      type: "sale",
      message: "Sale completed: 5x Wireless Mouse to Bob Johnson",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      amount: 249.95,
    },
  ])

  // Form states
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    minStock: "",
    supplier: "",
    barcode: "",
  })

  const [newSale, setNewSale] = useState({
    productId: "",
    quantity: "",
    customerName: "",
  })

  const [newPurchase, setNewPurchase] = useState({
    productId: "",
    quantity: "",
    unitPrice: "",
  })

  // UI states
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Modal states
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [showInvoice, setShowInvoice] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)

  // Date filter states
  const [dateFilter, setDateFilter] = useState("month")
  const [customDateRange, setCustomDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({ from: undefined, to: undefined })

  // Check for low stock and create activities
  useEffect(() => {
    const lowStockProducts = products.filter((p) => p.stock <= p.minStock)

    lowStockProducts.forEach((product) => {
      const existingActivity = activities.find((a) => a.type === "low_stock" && a.message.includes(product.name))

      if (!existingActivity) {
        const newActivity: Activity = {
          id: `low_stock_${product.id}_${Date.now()}`,
          type: "low_stock",
          message: `${product.name} is running low on stock (${product.stock} remaining)`,
          timestamp: new Date(),
        }
        setActivities((prev) => [newActivity, ...prev.slice(0, 9)]) // Keep only 10 activities
      }
    })
  }, [products])

  // Duplicate check function
  const checkDuplicate = (name: string, excludeId?: string): boolean => {
    return products.some((p) => p.name.toLowerCase() === name.toLowerCase() && p.id !== excludeId)
  }

  // Add new product with duplicate check
  const addProduct = () => {
    if (user?.role !== "admin") {
      toast.error("Only admins can add products")
      return
    }

    if (!newProduct.name || !newProduct.price || !newProduct.stock) {
      toast.error("Please fill in all required fields")
      return
    }

    if (checkDuplicate(newProduct.name)) {
      toast.error("Product with this name already exists!")
      return
    }

    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name,
      category: newProduct.category,
      price: Number.parseFloat(newProduct.price),
      stock: Number.parseInt(newProduct.stock),
      minStock: Number.parseInt(newProduct.minStock) || 0,
      supplier: newProduct.supplier,
      barcode: newProduct.barcode,
      createdAt: new Date(),
    }

    setProducts([...products, product])

    // Add activity
    const activity: Activity = {
      id: `product_added_${Date.now()}`,
      type: "product_added",
      message: `New product added: ${product.name}`,
      timestamp: new Date(),
    }
    setActivities((prev) => [activity, ...prev.slice(0, 9)])

    setNewProduct({
      name: "",
      category: "",
      price: "",
      stock: "",
      minStock: "",
      supplier: "",
      barcode: "",
    })

    toast.success("Product added successfully!")
  }

  // Update product
  const updateProduct = (updatedProduct: Product) => {
    if (user?.role !== "admin") {
      toast.error("Only admins can edit products")
      return
    }

    if (checkDuplicate(updatedProduct.name, updatedProduct.id)) {
      toast.error("Product with this name already exists!")
      return
    }

    setProducts(products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)))

    const activity: Activity = {
      id: `product_updated_${Date.now()}`,
      type: "product_added",
      message: `Product updated: ${updatedProduct.name}`,
      timestamp: new Date(),
    }
    setActivities((prev) => [activity, ...prev.slice(0, 9)])
  }

  // Delete product
  const deleteProduct = (productId: string) => {
    if (user?.role !== "admin") {
      toast.error("Only admins can delete products")
      return
    }

    const product = products.find((p) => p.id === productId)
    if (!product) return

    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      setProducts(products.filter((p) => p.id !== productId))
      toast.success("Product deleted successfully!")
    }
  }

  // Process sale
  const processSale = () => {
    if (!newSale.productId || !newSale.quantity || !newSale.customerName) {
      toast.error("Please fill in all fields")
      return
    }

    const product = products.find((p) => p.id === newSale.productId)
    if (!product || product.stock < Number.parseInt(newSale.quantity)) {
      toast.error("Insufficient stock!")
      return
    }

    const sale: Sale = {
      id: Date.now().toString(),
      productId: newSale.productId,
      productName: product.name,
      quantity: Number.parseInt(newSale.quantity),
      unitPrice: product.price,
      totalAmount: product.price * Number.parseInt(newSale.quantity),
      customerName: newSale.customerName,
      date: new Date(),
    }

    // Update inventory
    setProducts(
      products.map((p) =>
        p.id === newSale.productId ? { ...p, stock: p.stock - Number.parseInt(newSale.quantity) } : p,
      ),
    )

    setSales([sale, ...sales])

    // Add activity
    const activity: Activity = {
      id: `sale_${Date.now()}`,
      type: "sale",
      message: `Sale completed: ${sale.quantity}x ${sale.productName} to ${sale.customerName}`,
      timestamp: new Date(),
      amount: sale.totalAmount,
    }
    setActivities((prev) => [activity, ...prev.slice(0, 9)])

    setNewSale({
      productId: "",
      quantity: "",
      customerName: "",
    })

    // Show invoice
    setSelectedSale(sale)
    setShowInvoice(true)
    toast.success("Sale processed successfully!")
  }

  // Process purchase
  const processPurchase = () => {
    if (user?.role !== "admin") {
      toast.error("Only admins can record purchases")
      return
    }

    if (!newPurchase.productId || !newPurchase.quantity || !newPurchase.unitPrice) {
      toast.error("Please fill in all fields")
      return
    }

    const product = products.find((p) => p.id === newPurchase.productId)
    if (!product) return

    const purchase: Purchase = {
      id: Date.now().toString(),
      productId: newPurchase.productId,
      productName: product.name,
      quantity: Number.parseInt(newPurchase.quantity),
      unitPrice: Number.parseFloat(newPurchase.unitPrice),
      totalAmount: Number.parseFloat(newPurchase.unitPrice) * Number.parseInt(newPurchase.quantity),
      supplier: product.supplier,
      date: new Date(),
    }

    // Update inventory
    setProducts(
      products.map((p) =>
        p.id === newPurchase.productId ? { ...p, stock: p.stock + Number.parseInt(newPurchase.quantity) } : p,
      ),
    )

    setPurchases([purchase, ...purchases])

    // Add activity
    const activity: Activity = {
      id: `purchase_${Date.now()}`,
      type: "purchase",
      message: `Purchase recorded: ${purchase.quantity}x ${purchase.productName}`,
      timestamp: new Date(),
      amount: purchase.totalAmount,
    }
    setActivities((prev) => [activity, ...prev.slice(0, 9)])

    setNewPurchase({
      productId: "",
      quantity: "",
      unitPrice: "",
    })

    toast.success("Purchase recorded successfully!")
  }

  // Barcode scan handler
  const handleBarcodeScan = (barcode: string) => {
    const product = products.find((p) => p.barcode === barcode)
    if (product) {
      setNewSale({ ...newSale, productId: product.id })
      toast.success(`Product found: ${product.name}`)
    } else {
      toast.error("Product not found with this barcode")
    }
  }

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter

      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "low" && product.stock <= product.minStock) ||
        (stockFilter === "normal" && product.stock > product.minStock)

      return matchesSearch && matchesCategory && matchesStock
    })

    // Sort products
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Product]
      let bValue: any = b[sortBy as keyof Product]

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  }, [products, searchTerm, categoryFilter, stockFilter, sortBy, sortOrder])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage)
  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  // Get filtered sales based on date
  const getFilteredSales = () => {
    const now = new Date()
    let startDate: Date
    let endDate: Date = now

    switch (dateFilter) {
      case "today":
        startDate = startOfDay(now)
        endDate = endOfDay(now)
        break
      case "week":
        startDate = subDays(now, 7)
        break
      case "month":
        startDate = subDays(now, 30)
        break
      case "quarter":
        startDate = subDays(now, 90)
        break
      case "year":
        startDate = startOfYear(now)
        endDate = endOfYear(now)
        break
      case "custom":
        if (customDateRange.from && customDateRange.to) {
          startDate = customDateRange.from
          endDate = customDateRange.to
        } else {
          return sales
        }
        break
      default:
        return sales
    }

    return sales.filter((sale) => sale.date >= startDate && sale.date <= endDate)
  }

  const filteredSales = getFilteredSales()

  // Analytics calculations
  const categories = [...new Set(products.map((p) => p.category))]
  const totalProducts = products.length
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0)
  const lowStockProducts = products.filter((p) => p.stock <= p.minStock).length
  const totalSalesAmount = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0)

  // Chart data
  const salesByCategory = products.reduce(
    (acc, product) => {
      const productSales = filteredSales
        .filter((s) => s.productId === product.id)
        .reduce((sum, s) => sum + s.totalAmount, 0)

      if (productSales > 0) {
        acc[product.category] = (acc[product.category] || 0) + productSales
      }
      return acc
    },
    {} as Record<string, number>,
  )

  const categoryData = Object.entries(salesByCategory).map(([category, amount]) => ({
    category,
    amount,
  }))

  const topSellingProducts = products
    .map((product) => {
      const productSales = filteredSales
        .filter((s) => s.productId === product.id)
        .reduce((sum, s) => sum + s.quantity, 0)
      return { ...product, totalSold: productSales }
    })
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, 5)

  // Daily sales data for line chart
  const dailySalesData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i)
      const dayName = format(date, "EEE")
      const dayDate = format(date, "yyyy-MM-dd")

      const daySales = sales
        .filter((sale) => format(sale.date, "yyyy-MM-dd") === dayDate)
        .reduce((sum, sale) => sum + sale.totalAmount, 0)

      return { day: dayName, sales: daySales }
    })

    return last7Days
  }, [sales])

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <ToastProvider />
      <div className="max-w-7xl mx-auto">
        <UserHeader />

        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Inventory Management System</h1>
          <p className="text-gray-600 mt-2">Manage your products, track sales, and analyze performance</p>
        </div>

        {/* Dashboard Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStock}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{lowStockProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalSalesAmount.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Dashboard with Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Sales Trend (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={dailySalesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, "Sales"]} />
                  <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <RecentActivity activities={activities} />
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="purchases">Purchases</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            {user?.role === "admin" && (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Product</CardTitle>
                  <CardDescription>Add a new product to your inventory</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="productName">Product Name *</Label>
                      <Input
                        id="productName"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        placeholder="Enter product name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Input
                        id="category"
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        placeholder="Enter category"
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Price *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        placeholder="Enter price"
                      />
                    </div>
                    <div>
                      <Label htmlFor="stock">Initial Stock *</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={newProduct.stock}
                        onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                        placeholder="Enter stock quantity"
                      />
                    </div>
                    <div>
                      <Label htmlFor="minStock">Minimum Stock *</Label>
                      <Input
                        id="minStock"
                        type="number"
                        value={newProduct.minStock}
                        onChange={(e) => setNewProduct({ ...newProduct, minStock: e.target.value })}
                        placeholder="Enter minimum stock"
                      />
                    </div>
                    <div>
                      <Label htmlFor="supplier">Supplier *</Label>
                      <Input
                        id="supplier"
                        value={newProduct.supplier}
                        onChange={(e) => setNewProduct({ ...newProduct, supplier: e.target.value })}
                        placeholder="Enter supplier name"
                      />
                    </div>
                    <div className="md:col-span-2 lg:col-span-1">
                      <Label htmlFor="barcode">Barcode</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="barcode"
                          value={newProduct.barcode}
                          onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                          placeholder="Enter or scan barcode"
                        />
                        <Button type="button" variant="outline" onClick={() => setShowBarcodeScanner(true)}>
                          <Scan className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Button onClick={addProduct} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Products List</CardTitle>
                <div className="flex justify-end">
                  <ExportOptions data={filteredAndSortedProducts} filename="products" title="Products List" />
                </div>
              </CardHeader>
              <CardContent>
                {/* Enhanced Search and Filter */}
                <div className="space-y-4 mb-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search by name, category, or barcode..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={stockFilter} onValueChange={setStockFilter}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Filter by stock" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Stock Levels</SelectItem>
                        <SelectItem value="low">Low Stock</SelectItem>
                        <SelectItem value="normal">Normal Stock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="category">Category</SelectItem>
                        <SelectItem value="price">Price</SelectItem>
                        <SelectItem value="stock">Stock</SelectItem>
                        <SelectItem value="createdAt">Date Added</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Sort order" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Barcode</TableHead>
                        <TableHead>Supplier</TableHead>
                        {user?.role === "admin" && <TableHead>Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>${Number(product.price).toFixed(2)}</TableCell>

                          <TableCell>{product.stock}</TableCell>
                          <TableCell>
                            <Badge variant={product.stock <= product.minStock ? "destructive" : "default"}>
                              {product.stock <= product.minStock ? "Low Stock" : "In Stock"}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{product.barcode || "N/A"}</TableCell>
                          <TableCell>{product.supplier}</TableCell>
                          {user?.role === "admin" && (
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingProduct(product)
                                    setShowEditModal(true)
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => deleteProduct(product.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredAndSortedProducts.length}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Process Sale</CardTitle>
                <CardDescription>Record a new sale and update inventory automatically</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="saleProduct">Select Product</Label>
                    <div className="flex space-x-2">
                      <Select
                        value={newSale.productId}
                        onValueChange={(value) => setNewSale({ ...newSale, productId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} (Stock: {product.stock})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button type="button" variant="outline" onClick={() => setShowBarcodeScanner(true)}>
                        <Scan className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="saleQuantity">Quantity</Label>
                    <Input
                      id="saleQuantity"
                      type="number"
                      value={newSale.quantity}
                      onChange={(e) => setNewSale({ ...newSale, quantity: e.target.value })}
                      placeholder="Enter quantity"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input
                      id="customerName"
                      value={newSale.customerName}
                      onChange={(e) => setNewSale({ ...newSale, customerName: e.target.value })}
                      placeholder="Enter customer name"
                    />
                  </div>
                </div>
                <Button onClick={processSale} className="mt-4">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Process Sale
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sales History</CardTitle>
                <div className="flex justify-end">
                  <ExportOptions data={filteredSales} filename="sales" title="Sales Report" />
                </div>
              </CardHeader>
              <CardContent>
                <DateFilter
                  selectedFilter={dateFilter}
                  onFilterChange={setDateFilter}
                  customDateRange={customDateRange}
                  onDateRangeChange={setCustomDateRange}
                />

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSales.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell>{sale.date.toLocaleDateString()}</TableCell>
                          <TableCell>{sale.productName}</TableCell>
                          <TableCell>{sale.customerName}</TableCell>
                          <TableCell>{sale.quantity}</TableCell>
                          <TableCell>${sale.unitPrice.toFixed(2)}</TableCell>
                          <TableCell>${sale.totalAmount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedSale(sale)
                                setShowInvoice(true)
                              }}
                            >
                              Invoice
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Purchases Tab */}
          <TabsContent value="purchases" className="space-y-6">
            {user?.role === "admin" && (
              <Card>
                <CardHeader>
                  <CardTitle>Record Purchase</CardTitle>
                  <CardDescription>Add stock to inventory through purchases</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="purchaseProduct">Select Product</Label>
                      <Select
                        value={newPurchase.productId}
                        onValueChange={(value) => setNewPurchase({ ...newPurchase, productId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="purchaseQuantity">Quantity</Label>
                      <Input
                        id="purchaseQuantity"
                        type="number"
                        value={newPurchase.quantity}
                        onChange={(e) => setNewPurchase({ ...newPurchase, quantity: e.target.value })}
                        placeholder="Enter quantity"
                      />
                    </div>
                    <div>
                      <Label htmlFor="purchasePrice">Unit Price</Label>
                      <Input
                        id="purchasePrice"
                        type="number"
                        step="0.01"
                        value={newPurchase.unitPrice}
                        onChange={(e) => setNewPurchase({ ...newPurchase, unitPrice: e.target.value })}
                        placeholder="Enter unit price"
                      />
                    </div>
                  </div>
                  <Button onClick={processPurchase} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Record Purchase
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Purchase History</CardTitle>
                <div className="flex justify-end">
                  <ExportOptions data={purchases} filename="purchases" title="Purchase Report" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchases.map((purchase) => (
                        <TableRow key={purchase.id}>
                          <TableCell>{purchase.date.toLocaleDateString()}</TableCell>
                          <TableCell>{purchase.productName}</TableCell>
                          <TableCell>{purchase.supplier}</TableCell>
                          <TableCell>{purchase.quantity}</TableCell>
                          <TableCell>${purchase.unitPrice.toFixed(2)}</TableCell>
                          <TableCell>${purchase.totalAmount.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Inventory Status</CardTitle>
                <CardDescription>Monitor stock levels and identify low stock items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Minimum Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.stock}</TableCell>
                          <TableCell>{product.minStock}</TableCell>
                          <TableCell>
                            <Badge variant={product.stock <= product.minStock ? "destructive" : "default"}>
                              {product.stock <= product.minStock ? "Low Stock" : "Normal"}
                            </Badge>
                          </TableCell>
                          <TableCell>${(product.stock * product.price).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sales by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ category, amount }) => `${category}: $${amount.toFixed(0)}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="amount"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Selling Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topSellingProducts}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="totalSold" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Sales Performance</CardTitle>
                <CardDescription>Track your sales performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">${totalSalesAmount.toFixed(2)}</div>
                      <p className="text-sm text-muted-foreground">Total Sales</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{filteredSales.length}</div>
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">
                        ${(totalSalesAmount / filteredSales.length || 0).toFixed(2)}
                      </div>
                      <p className="text-sm text-muted-foreground">Avg Order Value</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{filteredSales.reduce((sum, s) => sum + s.quantity, 0)}</div>
                      <p className="text-sm text-muted-foreground">Items Sold</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <InvoiceModal sale={selectedSale} isOpen={showInvoice} onClose={() => setShowInvoice(false)} />

        <EditProductModal
          product={editingProduct}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onUpdate={(product) => {
            // Ensure createdAt is preserved from the original product
            if (editingProduct) {
              updateProduct({ ...product, createdAt: editingProduct.createdAt })
            }
          }}
        />

        <BarcodeScanner
          isOpen={showBarcodeScanner}
          onClose={() => setShowBarcodeScanner(false)}
          onScan={(barcode) => {
            handleBarcodeScan(barcode)
            setNewProduct({ ...newProduct, barcode })
          }}
        />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  )
}

function AuthenticatedApp() {
  const { user } = useAuth()

  if (!user) {
    return <LoginForm />
  }

  return <InventorySystem />
}
