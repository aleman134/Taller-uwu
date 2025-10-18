// tests/unit/repuestos.test.js
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

describe('Eliminar Repuesto de Orden - Pruebas Unitarias', () => {
  let mockFetch;
  let mockConfirm;
  let mockAlert;
  let mockRecargarModal;

  // Función que vamos a probar (copiada lógica del original)
  async function eliminarRepuestoUtilizado(id) {
    try {
      const res = await fetch(`http://localhost:3000/api/repuestos-utilizados/${id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || errorData.message || 'Error al eliminar repuesto');
      }
      
      return await res.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async function eliminarRepuestoOrden(id) {
    if (!confirm('¿Está seguro de eliminar este repuesto?')) return;
    
    try {
      await eliminarRepuestoUtilizado(id);
      alert('Repuesto eliminado exitosamente');
      await recargarModal();
    } catch (error) {
      console.error('Error al eliminar repuesto:', error);
      alert('Error al eliminar repuesto: ' + error.message);
    }
  }

  beforeEach(() => {
    mockFetch = jest.fn();
    mockConfirm = jest.fn();
    mockAlert = jest.fn();
    mockRecargarModal = jest.fn();

    global.fetch = mockFetch;
    global.confirm = mockConfirm;
    global.alert = mockAlert;
    global.recargarModal = mockRecargarModal;
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('eliminarRepuestoUtilizado', () => {
    it('debe eliminar exitosamente un repuesto cuando la respuesta es OK', async () => {
      const repuestoId = 123;
      const responseData = { 
        success: true, 
        message: 'Repuesto eliminado exitosamente' 
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => responseData
      });

      const resultado = await eliminarRepuestoUtilizado(repuestoId);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        `http://localhost:3000/api/repuestos-utilizados/${repuestoId}`,
        { method: 'DELETE' }
      );
      expect(resultado).toEqual(responseData);
    });

    it('debe lanzar un error cuando la respuesta no es OK', async () => {
      const repuestoId = 456;
      const errorData = { error: 'Repuesto no encontrado' };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => errorData
      });

      await expect(eliminarRepuestoUtilizado(repuestoId))
        .rejects
        .toThrow('Repuesto no encontrado');

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('debe manejar errores de red correctamente', async () => {
      const repuestoId = 789;
      const networkError = new Error('Network error');

      mockFetch.mockRejectedValueOnce(networkError);

      await expect(eliminarRepuestoUtilizado(repuestoId))
        .rejects
        .toThrow('Network error');
    });

    it('debe manejar respuesta con JSON inválido', async () => {
      const repuestoId = 321;
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => { throw new Error('Invalid JSON'); }
      });

      await expect(eliminarRepuestoUtilizado(repuestoId))
        .rejects
        .toThrow('Error desconocido');
    });
  });

  describe('eliminarRepuestoOrden', () => {
    it('debe eliminar repuesto y recargar modal cuando usuario confirma', async () => {
      const repuestoId = 100;
      mockConfirm.mockReturnValue(true);
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      await eliminarRepuestoOrden(repuestoId);

      expect(mockConfirm).toHaveBeenCalledWith('¿Está seguro de eliminar este repuesto?');
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockAlert).toHaveBeenCalledWith('Repuesto eliminado exitosamente');
      expect(mockRecargarModal).toHaveBeenCalledTimes(1);
    });

    it('no debe eliminar repuesto cuando usuario cancela', async () => {
      const repuestoId = 200;
      mockConfirm.mockReturnValue(false);

      await eliminarRepuestoOrden(repuestoId);

      expect(mockConfirm).toHaveBeenCalledWith('¿Está seguro de eliminar este repuesto?');
      expect(mockFetch).not.toHaveBeenCalled();
      expect(mockAlert).not.toHaveBeenCalled();
      expect(mockRecargarModal).not.toHaveBeenCalled();
    });

    it('debe mostrar mensaje de error cuando falla la eliminación', async () => {
      const repuestoId = 300;
      const errorMessage = 'Error al eliminar en base de datos';
      
      mockConfirm.mockReturnValue(true);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: errorMessage })
      });

      await eliminarRepuestoOrden(repuestoId);

      expect(mockConfirm).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockAlert).toHaveBeenCalledWith(`Error al eliminar repuesto: ${errorMessage}`);
      expect(mockRecargarModal).not.toHaveBeenCalled();
    });

    it('debe capturar y mostrar errores de red', async () => {
      const repuestoId = 400;
      mockConfirm.mockReturnValue(true);
      mockFetch.mockRejectedValueOnce(new Error('Connection timeout'));

      await eliminarRepuestoOrden(repuestoId);

      expect(mockAlert).toHaveBeenCalledWith('Error al eliminar repuesto: Connection timeout');
    });
  });
});