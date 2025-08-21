<template>
    <main class="prose">
        <v-divider />
        <h1>Aviso legal y Política de privacidad</h1>
        <p>Responsable: <strong>Carlos Tello Alvarado</strong> — Contacto: <strong>carlostello@usal.es</strong>.</p>
        <p>Objeto: plataforma web para gestionar usuarios, espacios, materiales y reservas en un entorno de coworking.
        </p>
        <h2>Propiedad intelectual</h2>
        <p>Los contenidos y el software de la plataforma están protegidos. No se permite su reproducción sin
            autorización.</p>
        <h2>Condiciones de uso</h2>
        <p>El usuario se compromete a un uso lícito y a respetar las normas de reserva. La plataforma puede suspender
            cuentas que incumplan las condiciones.</p>
        <h2>Datos tratados y finalidades</h2>
        <ul class="ml-4">
            <li><strong>Cuenta</strong>: email, nombre, rol → autenticación y gestión del perfil.</li>
            <li><strong>Reservas</strong>: recursos, fechas/horas, periodicidad → prestar el servicio.</li>
            <li><strong>Pagos</strong>: <code>orderID</code>, <code>captureID</code>, <code>status</code> →
                conciliación; sin datos de tarjeta.</li>
            <li><strong>Imágenes</strong>: portada de sala/material (subida por administradores) → catálogo interno.
            </li>
        </ul>
        <h2>Bases jurídicas</h2>
        <p>Ejecución de contrato (reservas/pagos) e interés legítimo (seguridad y mantenimiento).</p>
        <h2>Destinatarios/encargados</h2>
        <p>Proveedores necesarios para el servicio (p. ej., base de datos, correo, pagos).</p>
        <h2>Almacenamiento local</h2>
        <p>Se emplea <strong>LocalStorage</strong> para funciones técnicas (sesión/preferencias); no se utilizan cookies
            ni tecnologías de seguimiento.</p>
        <h2>Derechos ARSULIPO</h2>
        <p>Los derechos de acceso, portabilidad, limitación y oposición se tramitan <strong>manualmente</strong> por
            correo en <strong>carlostello@usal.es</strong>.
            El usuario puede <strong>rectificar</strong> sus datos básicos y <strong>borrar su cuenta</strong> desde la
            aplicación.</p>
        <h2>Conservación y seguridad</h2>
        <p>Los datos se conservan el tiempo necesario para prestar el servicio y se aplican medidas técnicas y
            organizativas acordes al riesgo.</p>

        <br>
        <v-divider />
        <h1>Política de cookies</h1>
        <p>En este sitio <strong>no utilizamos cookies</strong> propias ni de terceros con fines de analítica o
            publicidad.</p>
        <p>La aplicación usa <strong>LocalStorage</strong> exclusivamente para funciones técnicas (p. ej., sesión y
            preferencias) que no requieren consentimiento.</p>
        <p>Si en el futuro incorporamos herramientas que usen cookies no técnicas, pediremos
            <strong>consentimiento</strong> y actualizaremos esta política.
        </p>


        <br>
        <v-divider />
        <p class="text-sm">Última actualización: {{ date }}</p>
    </main>
    <br>

    <TonalButton color="grey" text="Volver" @click="routerBack" />
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import TonalButton from '@/components/TonalButton.vue';

const date = ref(new Date());
date.value = date.value.toLocaleDateString('es-ES');

const router = useRouter();

function routerBack() {
    router.go(-1);
}

</script>