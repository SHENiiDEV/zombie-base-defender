import { useRef, useState } from 'react';
import { router } from '@inertiajs/react';

export default function useEquipmentAction() {
    const busy = useRef(false);
    const [pending, setPending] = useState(null);
    const [message, setMessage] = useState(null);

    const perform = (key, url, data, success) => {
        if (busy.current) return;
        busy.current = true;
        setPending(key);
        setMessage(null);
        router.post(url, data, {
            preserveScroll: true,
            onSuccess: () => setMessage({ type: 'success', text: success }),
            onError: (errors) => setMessage({ type: 'error', text: errors.gold ? 'Insufficient gold. Earn more by repelling zombie waves.' : errors.gems ? 'Insufficient crystals. Top up balance in the shop.' : Object.values(errors)[0] || 'Failed to save changes.' }),
            onFinish: () => { busy.current = false; setPending(null); },
        });
    };

    return { pending, message, perform };
}
