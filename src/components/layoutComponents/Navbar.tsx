"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState, useMemo } from "react"
import { Bell, LogOut, ChevronDown, BookOpen, Menu, X } from "lucide-react"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { getSession, logout } from "@/utils/auth"
import posthog from "posthog-js"
import { useUser } from "@/utils/auth/userZustand"
import { UserPermissions } from "@/utils/auth/userZustand"
import { useQuery } from "@tanstack/react-query"
import { get } from "@/app/api/apiService"
import { usePathname } from "next/navigation"

interface NotificationSummaryItem {
  id: string
  tipo: "ACTIVIDAD" | "MEDIDA"
  titulo: string
  estado: string
  estado_display: string
  fecha: string | null
  legajo: {
    id: number
    numero: string
    nnya_nombre: string | null
    nnya_apellido: string | null
  } | null
  medida: { id: number; numero: string } | null
  url: string
}

interface NotificationSummary {
  total: number
  total_actividades: number
  total_medidas: number
  items: NotificationSummaryItem[]
  limit: number
  has_more: boolean
}

export default function Header() {
  const [showMenu, setShowMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showMobileNav, setShowMobileNav] = useState(false)
  const [loadingUser, setLoadingUser] = useState(true)
  const [isClient, setIsClient] = useState(false)

  const user = useUser((state) => state.user) as UserPermissions | null
  const pathname = usePathname()

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    setShowMobileNav(false)
  }, [pathname])

  useEffect(() => {
    async function fetchUser() {
      if (!user || Object.keys(user).length === 0) {
        const userData = await getSession(true)
        if (userData && typeof userData === 'object') {
          useUser.setState({ user: userData as UserPermissions })
        }
      }
      setLoadingUser(false)
    }

    fetchUser()
  }, [user])

  const isAdministracion = useMemo(() => {
    if (!user) return false
    const groupNames = (user.groups || []).map((g) => g.name.toLowerCase())
    return groupNames.some((n) => n.includes("administración") || n.includes("administracion"))
  }, [user])

  // El backend aplica permisos, zonas y roles y devuelve un contrato mínimo.
  // Esto evita descargar y recomputar hasta 200 registros cada minuto.
  const {
    data: notificationSummary,
    isLoading: loadingNotifications,
    isError: notificationsFailed,
    refetch: refetchNotifications,
  } = useQuery({
    queryKey: ['navbar-notifications-summary', user?.id],
    queryFn: () => get<NotificationSummary>('notificaciones/resumen/', { limit: 10 }),
    enabled: !!user?.id,
    refetchInterval: 60 * 1000,
    staleTime: 30 * 1000,
  })

  const pendingActivities = notificationSummary?.items ?? []
  const pendingCount = notificationSummary?.total ?? 0

  const handleLogout = async () => {
    try {
      await logout();
      try { posthog.reset(); } catch { /* noop */ }
      useUser.setState({ user: null });

      toast.success("Sesión cerrada con éxito");
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    } catch (error) {
      console.error("No se pudo cerrar la sesión:", error);
      toast.error("No se pudo cerrar la sesión. Intentá nuevamente.");
    }
  }

  if (!isClient || loadingUser) {
    return (
      <header
        className="sticky top-0 z-[1200] text-white px-3 sm:px-6 py-3 flex justify-between items-center h-[72px] shadow-md gap-2 overflow-hidden"
        style={{ backgroundColor: '#00457F' }}
      >
        <div className="flex items-center min-w-0">
          <div className="w-32 sm:w-48 md:w-64 h-10 bg-white/20 rounded animate-pulse"></div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          <div className="hidden sm:block w-24 md:w-36 h-9 bg-white/20 rounded-md animate-pulse"></div>
          <div className="hidden sm:block w-24 md:w-36 h-9 bg-white/20 rounded-md animate-pulse"></div>
          <div className="w-8 h-8 bg-white/20 rounded-full animate-pulse"></div>
          <div className="w-8 h-8 bg-white/20 rounded-full animate-pulse"></div>
          <div className="w-10 h-10 bg-white/20 rounded-full animate-pulse"></div>
        </div>
      </header>
    )
  }

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim()
  const displayName = fullName || user?.username || "Invitado"
  const displayRole = user?.is_superuser
    ? "Administrador"
    : user?.groups?.[0]?.name || "Sin rol asignado"
  const avatarText = fullName
    ? `${user?.first_name?.[0] || ""}${user?.last_name?.[0] || ""}`
    : user?.username?.slice(0, 2).toUpperCase() || "?"

  const navItems = [
    { href: "/mesadeentrada", label: "Mesa de Entradas", visible: true },
    { href: "/legajo-mesa", label: "Bandeja de legajos", visible: !isAdministracion },
    { href: "/legajo/actividades", label: "Mis actividades", visible: !isAdministracion },
    { href: "/indicadores", label: "Indicadores", visible: true },
    { href: "/oficios", label: "Oficios", visible: true },
  ].filter((item) => item.visible)

  const isCurrentPath = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <header
      className="sticky top-0 z-[1200] text-white px-3 sm:px-6 py-3 flex justify-between items-center shadow-md gap-2 relative"
      style={{ backgroundColor: '#00457F' }}
    >
      {/* Logo Gobierno de Córdoba - Lado Izquierdo (Branding) */}
      <Link
        href="/mesadeentrada"
        aria-label="Ir a Mesa de Entradas"
        className="flex-shrink min-w-0 transition-opacity hover:opacity-90"
      >
        <div className="relative h-9 w-28 sm:h-11 sm:w-48 md:h-12 md:w-64">
          <Image
            src="/img/Screenshot 2026-03-18 002042.png"
            alt="Gobierno de la Provincia de Córdoba"
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>
      </Link>

      {/* Navegación y Usuario - Lado Derecho */}
      <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
        {/* Navegación completa en escritorio. En tablet/móvil se reemplaza por un menú. */}
        <nav className="hidden xl:flex gap-2" aria-label="Navegación principal">
          {navItems.filter((item) => item.href !== "/legajo/actividades").map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isCurrentPath(item.href) ? "page" : undefined}
              className="px-3 xl:px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-[rgba(0,188,212,0.25)] cursor-pointer no-underline text-white whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              style={{
                backgroundColor: isCurrentPath(item.href)
                  ? 'rgba(0, 188, 212, 0.3)'
                  : 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          aria-label={showMobileNav ? "Cerrar menú principal" : "Abrir menú principal"}
          aria-expanded={showMobileNav}
          aria-controls="mobile-main-navigation"
          onClick={() => {
            setShowMobileNav((open) => !open)
            setShowNotifications(false)
            setShowMenu(false)
          }}
          className="xl:hidden flex p-2 rounded-md transition-colors items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          style={{ backgroundColor: showMobileNav ? 'rgba(0, 188, 212, 0.3)' : 'rgba(255, 255, 255, 0.15)' }}
        >
          {showMobileNav ? <X size={21} /> : <Menu size={21} />}
        </button>

        {showMobileNav && (
          <nav
            id="mobile-main-navigation"
            aria-label="Navegación principal"
            className="xl:hidden absolute left-0 right-0 top-full bg-[#003866] border-t border-white/15 shadow-xl p-3"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-3xl ml-auto">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isCurrentPath(item.href) ? "page" : undefined}
                  onClick={() => setShowMobileNav(false)}
                  className="rounded-lg px-4 py-3 text-sm font-semibold text-white no-underline transition-colors hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  style={{ backgroundColor: isCurrentPath(item.href) ? 'rgba(0, 188, 212, 0.3)' : 'rgba(255,255,255,0.08)' }}
                >
                  {item.label}
                </Link>
              ))}
              <a
                href="https://capacitacion-tutorial-runna-umber.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg px-4 py-3 text-sm font-semibold text-white no-underline transition-colors hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white flex items-center gap-2"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
              >
                <BookOpen size={18} aria-hidden="true" />
                Manual de capacitación
              </a>
            </div>
          </nav>
        )}

        {/* Tutorial */}
        <a
          href="https://capacitacion-tutorial-runna-umber.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          title="Manual de capacitación"
          aria-label="Abrir manual de capacitación en una nueva pestaña"
          className="hidden xl:flex p-2 rounded-full transition-all duration-200 hover:scale-110 items-center justify-center"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 188, 212, 0.25)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'
          }}
        >
          <BookOpen size={20} />
        </a>

        {/* Notificaciones */}
        <div className="relative">
          <button
            type="button"
            aria-label={pendingCount > 0 ? `Notificaciones: ${pendingCount} pendientes` : "Notificaciones"}
            aria-expanded={showNotifications}
            aria-haspopup="true"
            onClick={() => {
              setShowNotifications(!showNotifications)
              setShowMenu(false)
              setShowMobileNav(false)
            }}
            className="p-2 rounded-full transition-all duration-200 hover:scale-110 relative"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
            }}
            onMouseEnter={(e) => {
              if (!showNotifications) e.currentTarget.style.backgroundColor = 'rgba(0, 188, 212, 0.25)'
            }}
            onMouseLeave={(e) => {
              if (!showNotifications) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'
            }}
          >
            <Bell size={20} />
            {pendingCount > 0 && (
              <span
                className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-md border-2 border-[#00457F]"
                title={`${pendingCount} tareas pendientes que requieren tu acción`}
              >
                {pendingCount > 99 ? '99+' : pendingCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div
              className="absolute right-0 mt-3 w-[min(20rem,calc(100vw-1.5rem))] bg-white rounded-lg shadow-2xl z-[1300] overflow-hidden text-gray-800 border border-cyan-100"
            >
              <div className="p-3 border-bottom border-gray-100 bg-gray-50 flex justify-between items-center">
                <span className="font-bold text-sm text-gray-700">Notificaciones</span>
                <span className="text-[10px] px-2 py-0.5 bg-cyan-100 text-cyan-800 rounded-full font-bold">
                  {loadingNotifications
                    ? "CARGANDO"
                    : notificationsFailed
                      ? "NO DISPONIBLE"
                      : `${pendingCount} PENDIENTES`}
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {loadingNotifications ? (
                  <div className="p-8 text-center" role="status">
                    <p className="text-sm text-gray-500">Cargando notificaciones…</p>
                  </div>
                ) : notificationsFailed ? (
                  <div className="p-6 text-center" role="alert">
                    <p className="text-sm text-gray-600 mb-3">No se pudieron cargar las notificaciones.</p>
                    <button
                      type="button"
                      onClick={() => void refetchNotifications()}
                      className="text-xs font-bold text-cyan-700 hover:underline"
                    >
                      Reintentar
                    </button>
                  </div>
                ) : pendingActivities.length > 0 ? (
                  pendingActivities.map((act) => (
                    <Link
                      key={act.id}
                      href={act.url}
                      className="block p-3 hover:bg-cyan-50 transition-colors border-b border-gray-50 last:border-0"
                      onClick={() => setShowNotifications(false)}
                    >
                      <div className="flex gap-2">
                        <div className="w-2 h-2 mt-1.5 rounded-full bg-cyan-500 shrink-0"></div>
                        <div>
                          <p className="text-xs font-bold leading-tight line-clamp-2">
                            {act.titulo || 'Nueva actividad'}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">
                            {act.legajo?.numero} - {act.legajo?.nnya_apellido}, {act.legajo?.nnya_nombre}
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-[9px] uppercase font-bold text-cyan-600">
                              {act.estado_display || act.estado}
                            </span>
                            <span className="text-[9px] text-gray-400">
                              {act.fecha ? new Date(`${act.fecha}`.slice(0, 10) + 'T00:00:00').toLocaleDateString('es-AR') : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Bell size={20} className="text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-500">No tienes tareas pendientes</p>
                  </div>
                )}
              </div>

              {!notificationsFailed && pendingActivities.length > 0 && (
                <Link
                  href="/legajo/actividades"
                  className="block p-3 text-center text-xs font-bold text-cyan-600 hover:bg-gray-50 border-t border-gray-100 bg-gray-50/50"
                  onClick={() => setShowNotifications(false)}
                >
                  Ver todas las actividades
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Avatar y Menú de Usuario */}
        <div className="relative">
          <button
            type="button"
            aria-label={`Menú de usuario de ${displayName}`}
            aria-expanded={showMenu}
            aria-haspopup="true"
            onClick={() => {
              setShowMenu(!showMenu)
              setShowNotifications(false)
              setShowMobileNav(false)
            }}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-md transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 188, 212, 0.25)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'
            }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                {avatarText}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-sm font-medium">
                  {displayName}
                </div>
                <div className="text-xs opacity-80">
                  {displayRole}
                </div>
              </div>
              <ChevronDown
                size={16}
                className={`hidden sm:block transition-transform duration-200 ${showMenu ? 'rotate-180' : ''}`}
              />
            </div>
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div
              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-[1300] overflow-hidden"
              style={{
                border: '1px solid rgba(0, 188, 212, 0.2)',
              }}
            >
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 text-left text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-200"
              >
                <LogOut size={18} className="text-red-600" />
                <span className="font-medium">Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
