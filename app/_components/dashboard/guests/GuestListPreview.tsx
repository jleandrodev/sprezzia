"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/app/_components/ui/badge";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/app/_components/ui/pagination";
import { useToast } from "@/app/_hooks/use-toast";
import { useGuests } from "@/app/_hooks/use-guests";

interface Guest {
  id: string;
  name: string;
  companions: Array<{
    id: string;
    name: string;
    status: "PENDENTE" | "CONFIRMADO_PRESENCA" | "CONFIRMADO_AUSENCIA";
  }>;
  status: "PENDENTE" | "CONFIRMADO_PRESENCA" | "CONFIRMADO_AUSENCIA";
}

interface GuestListPreviewProps {
  projectId: string;
}

export default function GuestListPreview({ projectId }: GuestListPreviewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { guests, isLoading, fetchGuests } = useGuests(projectId);
  const { toast } = useToast();
  const itemsPerPage = 5;

  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  useEffect(() => {
    setTotalPages(Math.ceil(guests.length / itemsPerPage));
  }, [guests, itemsPerPage]);

  const getStatusStyle = (status: Guest["status"]) => {
    switch (status) {
      case "CONFIRMADO_PRESENCA":
        return "bg-green-100 text-green-800";
      case "CONFIRMADO_AUSENCIA":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const paginatedGuests = guests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Acompanhantes</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedGuests.map((guest) => (
            <TableRow key={guest.id}>
              <TableCell>{guest.name}</TableCell>
              <TableCell>{guest.companions.length}</TableCell>
              <TableCell>
                <Badge className={getStatusStyle(guest.status)}>
                  {guest.status === "CONFIRMADO_PRESENCA"
                    ? "Confirmado"
                    : guest.status === "CONFIRMADO_AUSENCIA"
                      ? "Ausente"
                      : "Pendente"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
          {paginatedGuests.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center">
                Nenhum convidado cadastrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="py-4 border-t">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }).map((_, index) => (
                <PaginationItem key={index + 1}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(index + 1);
                    }}
                    isActive={currentPage === index + 1}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages)
                      setCurrentPage(currentPage + 1);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
