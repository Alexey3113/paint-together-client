import React, { ChangeEvent, useCallback, useState } from 'react'
import ModalWrapper from './ModalWrapper'

import styles from "./Modal.module.scss"
import Button from '../Button/Button'

export interface IProps {
  isModalOpen: boolean,
  setIsModalOpen: (value: boolean) => void,
  callbackBtnClick: Function,
}


const NicknameModal: React.FC<IProps> = ({isModalOpen, setIsModalOpen, callbackBtnClick}) => {

  const [fieldValue, setFieldValue] = useState<string>("")

  const handleFieldValue = (e: ChangeEvent<HTMLInputElement>) => {
      setFieldValue(e.target.value)
  }

  const handleBtnClick = useCallback((e: any) => {
      callbackBtnClick(fieldValue)
  }, [fieldValue])

  return (
    <ModalWrapper title='Введите ваше имя' isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen}>
        <div className={styles.nickNameModal}>
            <input value={fieldValue} onChange={handleFieldValue} type="text" />
            <Button title='Ввести имя' onClick={handleBtnClick} />
        </div>
    </ModalWrapper>
  )
}

export default NicknameModal