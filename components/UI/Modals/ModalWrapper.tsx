import React from 'react'

import styles from "./Modal.module.scss"

export interface IModal {
    isModalOpen: boolean,
    setIsModalOpen: (value: boolean) => void,
    children: React.ReactNode,
    title: string
}

const ModalWrapper: React.FC<IModal> = ({isModalOpen, setIsModalOpen, children, title}) => {
    const handleChangeModalState = () => {
        setIsModalOpen(!isModalOpen)
    }

    if(!isModalOpen) return <></>;

  return (
    <div className={styles.modalWrapper}>
        <div className={styles.modalBody}>
            <div className={styles.modalTitle}> {title} </div>
            {children}
        </div>
    </div>
  )
}

export default ModalWrapper